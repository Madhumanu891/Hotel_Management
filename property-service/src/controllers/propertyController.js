const propertyService = require("../services/propertyService");
const asyncHandler = require("../../../shared/utils/asyncHandler");
const upload = require("../middlewares/upload");

// ── Properties ────────────────────────────────────────────────────────────────

const getProperties = asyncHandler(async (req, res) => {
  const result = await propertyService.getProperties(req.query);
  res.status(200).json({ success: true, ...result });
});

const getPropertyBySlug = asyncHandler(async (req, res) => {
  const property = await propertyService.getPropertyBySlug(req.params.slug);
  res.status(200).json({ success: true, data: property });
});

const createProperty = asyncHandler(async (req, res) => {
  const property = await propertyService.createProperty(req.body, req.user._id);
  res.status(201).json({
    success: true,
    message: "Property created successfully",
    data: property,
  });
});

const updateProperty = asyncHandler(async (req, res) => {
  const property = await propertyService.updateProperty(
    req.params.id,
    req.body,
    req.user,
  );
  res.status(200).json({
    success: true,
    message: "Property updated successfully",
    data: property,
  });
});

const deactivateProperty = asyncHandler(async (req, res) => {
  await propertyService.deactivateProperty(req.params.id, req.user);
  res.status(200).json({
    success: true,
    message: "Property deactivated successfully",
  });
});

// ── Images ────────────────────────────────────────────────────────────────────

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No image file provided",
    });
  }

  const property = await propertyService.uploadPropertyImage(
    req.params.id,
    req.file,
    req.body.caption,
    req.body.isPrimary === "true",
  );

  res.status(200).json({
    success: true,
    message: "Image uploaded successfully",
    data: property.images,
  });
});

const deleteImage = asyncHandler(async (req, res) => {
  const property = await propertyService.deletePropertyImage(
    req.params.id,
    req.params.publicId,
  );

  res.status(200).json({
    success: true,
    message: "Image deleted successfully",
    data: property.images,
  });
});

// ── Room Types ────────────────────────────────────────────────────────────────

const getRoomTypes = asyncHandler(async (req, res) => {
  const roomTypes = await propertyService.getRoomTypes(req.params.id);
  res.status(200).json({ success: true, data: roomTypes });
});

const createRoomType = asyncHandler(async (req, res) => {
  const roomType = await propertyService.createRoomType(
    req.params.id,
    req.body,
  );
  res.status(201).json({
    success: true,
    message: "Room type created successfully",
    data: roomType,
  });
});

const updateRoomType = asyncHandler(async (req, res) => {
  const roomType = await propertyService.updateRoomType(
    req.params.id,
    req.params.roomTypeId,
    req.body,
  );
  res.status(200).json({
    success: true,
    message: "Room type updated successfully",
    data: roomType,
  });
});

const deleteRoomType = asyncHandler(async (req, res) => {
  await propertyService.deleteRoomType(req.params.id, req.params.roomTypeId);
  res.status(200).json({
    success: true,
    message: "Room type deactivated successfully",
  });
});

// ── Rooms ─────────────────────────────────────────────────────────────────────

const getRooms = asyncHandler(async (req, res) => {
  const rooms = await propertyService.getRooms(req.params.id, req.query);
  res.status(200).json({ success: true, data: rooms });
});

const createRoom = asyncHandler(async (req, res) => {
  const room = await propertyService.createRoom(req.params.id, req.body);
  res.status(201).json({
    success: true,
    message: "Room created successfully",
    data: room,
  });
});

const updateRoomStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const room = await propertyService.updateRoomStatus(
    req.params.id,
    req.params.roomId,
    status,
    note,
  );
  res.status(200).json({
    success: true,
    message: "Room status updated",
    data: room,
  });
});

const searchAvailable = asyncHandler(async (req, res) => {
  const result = await propertyService.searchAvailable(req.query);

  res.status(200).json({
    success: true,
    message: `Found ${result.properties.length} available properties`,
    ...result,
  });
});

const getPropertyById= asyncHandler(async (req, res) => {
  const property = await propertyService.getPropertyById(req.params.id);
  res.status(200).json({ success: true, data: property });
});

module.exports = {
  getProperties,
  getPropertyBySlug,
  createProperty,
  updateProperty,
  deactivateProperty,
  uploadImage,
  deleteImage,
  getRoomTypes,
  createRoomType,
  updateRoomType,
  deleteRoomType,
  getRooms,
  createRoom,
  updateRoomStatus,
  searchAvailable,
  getPropertyById,
};
