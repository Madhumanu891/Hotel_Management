const Property = require("../models/Property.model");
const RoomType = require("../models/RoomType.model");
const Room = require("../models/Room.model");
const { uploadBuffer, deleteImage } = require("../utils/cloudinaryUpload");
const {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  AppError,
} = require("../../../shared/errors");
const { getRedisClient } = require("../config/redis");

// Cache TTl values
const CACHE_TTL = {
  AVAILABILITY: 5 * 60, // 5 minutes for availability search results
  PROPERTIES: 10 * 60, // 10 minutes for property details
  PROPERTY: 15 * 60, // 15 minutes for individual property details
};

// Cache helper functions
const getCache = async (key) => {
  try {
    const redis = getRedisClient();
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    // If Redis fails, continue without cache — never crash for cache miss
    return null;
  }
};

const setCache = async (key, data, ttl) => {
  try {
    const redis = getRedisClient();
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch (err) {
    // If Redis fails, continue — caching is non-critical
  }
};

const clearCache = async (pattern) => {
  try {
    const redis = getRedisClient();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    // Non-critical
  }
};

// GET ALL PROPERTIES
// Supports filtering by: city, starRating, amenities, maxPrice
// Supports pagination: page, limit
const getProperties = async (query) => {
  const {
    city,
    minRating,
    maxPrice,
    amenities,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  // Build cache key from query params
  const cacheKey = `properties:${JSON.stringify(query)}`;

  // Check cache first
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  // Build filter object based on query parameters
  const filter = { isActive: true }; // Only return active properties

  if (city) {
    // Case-insensitive city search
    filter["location.city"] = new RegExp(city, "i"); // Matches city name regardless of case
  }

  if (minRating) {
    filter.starRating = { $gte: Number(minRating) }; // Minimum star rating
  }

  if (amenities) {
    // amenities=wifi,pool -> ["wifi","pool"]
    const amenityList = amenities.split(",").map((a) => a.trim());
    filter.amenities = { $all: amenityList }; // Must have All requested amenities
  }

  // Build sort object
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  // Coiunt total matching documents for pagination
  const total = await Property.countDocuments(filter);

  // Fetch paginated resultes
  const properties = await Property.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .select("-images.publicId") // Exclude publicId from response for security
    .lean(); // Return plain JS objects instead of Mongoose documents for better performance

  const result = {
    properties,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };

  // Store in cache
  await setCache(cacheKey, result, CACHE_TTL.PROPERTIES);

  return result;
};

// GET ONE PROPERTY BY SLUG
const getPropertyBySlug = async (slug) => {
  const property = await Property.findOne({ slug, isActive: true }).lean(); // Include manager info

  if (!property) throw new NotFoundError(`Property not found : ${slug}`);

  return property;
};

// GET ONE PROPERTY BY ID
const getPropertyById = async (id) => {
  const property = await Property.findById(id).lean();
  if (!property) throw new NotFoundError("Property not found");
  return property;
};

// CREATE PROPERTY
// Only hotel_manager and super_admin can create properties
const createProperty = async (data, userId) => {
  const property = await Property.create({
    ...data,
    managedBy: userId,
  });

  await clearCache("properties:*");
  await clearCache("availability:*");

  return property;
};

// UPDATE PROPERTY
// Manager can only update their own property
// super_admin can update any property
const updateProperty = async (id, data, user) => {
  const property = await Property.findById(id);
  if (!property) throw new NotFoundError("Property not found");

  // Check ownership - hotel_manager can only edit their own property
  if (
    user.role == "hotel_manager" &&
    property.managedBy?.toString() !== user._id.toString() // Convert ObjectId to string for comparison between manager and property owner
  ) {
    throw new ForbiddenError("You can only update your own property");
  }

  // Update fields
  Object.assign(property, data);
  await property.save();

  await clearCache("properties:*");
  await clearCache("availability:*");
  await clearCache(`property:${id}`);

  return property;
};

// DELETE (DEACTIVATE) PROPERTY
// We never hard-delete — just set isActive: false
// Preserves booking history
const deactivateProperty = async (id, user) => {
  const property = await Property.findById(id);
  if (!property) throw new NotFoundError("Property not found");

  // Check ownership - hotel_manager can only delete their own property
  if (
    user.role == "hotel_manager" &&
    property.managedBy?.toString() !== user._id.toString() // Convert ObjectId to string for comparison between manager and property owner
  ) {
    throw new ForbiddenError("You can only delete your own property");
  }

  property.isActive = false;
  await property.save();
};

// UPLOAD PROPERTY IMAGE
// Uploads image buffer to Cloudinary and saves URL and publicId in property document
const uploadPropertyImage = async (propertyId, file, caption, isPrimary) => {
  const property = await Property.findById(propertyId);
  if (!property) throw new NotFoundError("Property not found");

  // Upload to Cloudinary
  const result = await uploadBuffer(
    file.buffer,
    `hotel-management/properties/${propertyId}`,
  );

  //If this is set as primary, remove primary flag from others
  if (isPrimary) {
    property.images.forEach((img) => (img.isPrimary = false));
  }

  // Add to images array
  property.images.push({
    url: result.secure_url,
    publicId: result.public_id,
    caption: caption || "", // Optional caption
    isPrimary: !!isPrimary || property.images.length === 0, // Set as primary if flagged or if it's the first image
  });

  await property.save();
  return property;
};

// DELETE PROPERTY IMAGE
const deletePropertyImage = async (propertyId, publicId) => {
  const property = await Property.findById(propertyId);
  if (!property) throw new NotFoundError("Property not found");

  // Remove from Cloudinary
  await deleteImage(publicId);

  // Remove from property image array
  property.images = property.images.filter((img) => img.publicId !== publicId);

  // If we deleted the primary image, make first remaining image primary
  if (
    property.images.length > 0 &&
    !property.images.some((img) => img.isPrimary)
  ) {
    property.images[0].isPrimary = true;
  }

  await property.save();
  return property;
};

// ROOM TYPE OPERATIONS
const getRoomTypes = async (propertyId) => {
  const roomTypes = await RoomType.find({ propertyId, isActive: true }).lean();
  return roomTypes;
};

const createRoomType = async (propertyId, data) => {
  const property = await Property.findById(propertyId);
  if (!property) throw new NotFoundError("Property not found");

  const roomType = await RoomType.create({ ...data, propertyId });
  return roomType;
};

const updateRoomType = async (propertyId, roomTypeId, data) => {
  const roomType = await RoomType.findOne({ _id: roomTypeId, propertyId });
  if (!roomType) throw new NotFoundError("Room type not found");

  Object.assign(roomType, data);
  await roomType.save();
  return roomType;
};

const deleteRoomType = async (propertyId, roomTypeId) => {
  const roomType = await RoomType.findOne({ _id: roomTypeId, propertyId });
  if (!roomType) throw new NotFoundError("Room type not found");

  roomType.isActive = false;
  await roomType.save();
  return roomType;
};

// ROOM OPERATIONS
const getRooms = async (propertyId, query = {}) => {
  const filter = { propertyId, ...query };
  const rooms = await Room.find(filter)
    .populate("roomTypeId", "name basePrice")
    .lean();
  return rooms;
};

const createRoom = async (propertyId, data) => {
  const room = await Room.create({ ...data, propertyId });
  await clearCache("availability:*");
  return room;
};

const updateRoomStatus = async (propertyId, roomId, status, note) => {
  const room = await Room.findOne({ _id: roomId, propertyId });
  if (!room) throw new NotFoundError("Room not found");

  room.status = status;
  if (note) room.maintenanceNote = note;
  if (status === "available") {
    room.maintenanceNote = undefined;
    room.lastCleaned = new Date();
  }

  await room.save();
  return room;
};

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH AVAILABLE PROPERTIES
// Returns properties that have at least one available room type
// for the requested dates and guest count
//
// At this stage we check room inventory count vs existing bookings
// When Booking Service is built (Day 22), it will call this same logic
// ─────────────────────────────────────────────────────────────────────────────
const searchAvailable = async (query) => {
  const {
    city,
    checkIn,
    checkOut,
    adults = 1,
    children = 0,
    minRating,
    amenities,
    maxPrice,
    page = 1,
    limit = 10,
  } = query;

  // Validate dates
  if (!checkIn || !checkOut) {
    throw new AppError(
      "checkIn and checkOut dates are required",
      400,
      "MISSING_DATES",
    );
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkInDate < today) {
    throw new AppError(
      "Check-in date cannot be in the past",
      400,
      "INVALID_DATE",
    );
  }

  if (checkOutDate <= checkInDate) {
    throw new AppError("Check-out must be after check-in", 400, "INVALID_DATE");
  }

  // Check cache
  const cacheKey = `availability:${JSON.stringify(query)}`;
  const cached = await getCache(cacheKey);
  if (cached) return { ...cached, fromCache: true };

  const totalGuests = Number(adults) + Number(children);

  // Step 1: Find matching active properties
  const propertyFilter = { isActive: true };
  if (city) propertyFilter["location.city"] = new RegExp(city, "i");
  if (minRating) propertyFilter.starRating = { $gte: Number(minRating) };
  if (amenities) {
    propertyFilter.amenities = {
      $all: amenities.split(",").map((a) => a.trim()),
    };
  }

  const properties = await Property.find(propertyFilter).lean();

  // Step 2: For each property, find available room types
  const results = [];

  for (const property of properties) {
    // Get all active room types for this property
    const roomTypeFilter = {
      propertyId: property._id,
      isActive: true,
      maxOccupancy: { $gte: totalGuests }, // Must fit all guests
    };

    if (maxPrice) roomTypeFilter.basePrice = { $lte: Number(maxPrice) };

    const roomTypes = await RoomType.find(roomTypeFilter).lean();

    const availableRoomTypes = [];

    for (const roomType of roomTypes) {
      // Count total rooms of this type
      const totalRooms = await Room.countDocuments({
        propertyId: property._id,
        roomTypeId: roomType._id,
        status: "available",
      });

      if (totalRooms === 0) continue; // No rooms of this type

      // NOTE: When Booking Service exists (Day 22), we will query it here
      // to get count of overlapping confirmed bookings.
      // For now we assume all available rooms are bookable.
      // This placeholder will be replaced in Day 22.
      const blockedRooms = 0; // TODO: query booking-service

      const availableCount = totalRooms - blockedRooms;

      if (availableCount > 0) {
        // Calculate pricing for the stay
        const roomTypeDoc = await RoomType.findById(roomType._id);
        const pricing = roomTypeDoc.calculateTotalPrice(checkIn, checkOut);

        availableRoomTypes.push({
          ...roomType,
          availableCount,
          pricing,
        });
      }
    }

    // Only include property if it has at least one available room type
    if (availableRoomTypes.length > 0) {
      results.push({
        ...property,
        availableRoomTypes,
      });
    }
  }

  // Pagination on results
  const total = results.length;
  const paginated = results.slice((page - 1) * limit, page * limit);

  const response = {
    properties: paginated,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
    searchParams: { city, checkIn, checkOut, adults, children },
  };

  // Cache the result
  await setCache(cacheKey, response, CACHE_TTL.AVAILABILITY);

  return response;
};

module.exports = {
  getProperties,
  getPropertyBySlug,
  getPropertyById,
  createProperty,
  updateProperty,
  deactivateProperty,
  uploadPropertyImage,
  deletePropertyImage,
  getRoomTypes,
  createRoomType,
  updateRoomType,
  deleteRoomType,
  getRooms,
  createRoom,
  updateRoomStatus,
  searchAvailable,
};
