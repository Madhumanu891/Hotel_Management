const Booking = require("../models/Booking.model");
const axios = require("axios");
const { publishEvent } = require("../../../shared/events/rabbitmq");
const { getRedisClient } = require("../config/redis");
const {
  AppError,
  NotFoundError,
  ForbiddenError,
} = require("../../../shared/errors");

// ─────────────────────────────────────────────────────────────────────────────
// CHECK AVAILABILITY
// Core algorithm — prevents double booking
// Called before every booking creation
// ─────────────────────────────────────────────────────────────────────────────
const checkAvailability = async ({
  propertyId,
  roomTypeId,
  checkInDate,
  checkOutDate,
  guests = 1,
}) => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (checkIn >= checkOut) {
    throw new AppError("Check-out must be after check-in", 400, "INVALID_DATE");
  }

  // Count total available rooms of this type
  // We call property-service to get this count
  let totalRooms = 0;
  try {
    const url = `${process.env.PROPERTY_SERVICE_URL}/api/properties/${propertyId}/rooms`;
    console.log("Calling:", url);
    console.log("Params:", { roomTypeId, status: "available" });

    const res = await axios.get(url, {
      params: { roomTypeId, status: "available" },
      headers: { "x-internal-service": "booking-service" },
      timeout: 5000, // 5 second timeout
    });

    console.log(
      "Property service response:",
      res.status,
      JSON.stringify(res.data),
    );
    totalRooms = res.data.data.length;
  } catch (err) {
    console.log("Axios error details:");
    console.log("  Message:", err.message);
    console.log("  Code:", err.code);
    console.log("  Status:", err.response?.status);
    console.log("  Response data:", JSON.stringify(err.response?.data));
    console.log("  URL:", err.config?.url);

    throw new AppError(
      "Cannot verify room availability. Please try again.",
      503,
      "SERVICE_UNAVAILABLE",
    );
  }

  if (totalRooms === 0) {
    return {
      available: false,
      availableCount: 0,
      totalRooms: 0,
      blockedRooms: 0,
    };
  }

  // Count bookings that OVERLAP with requested dates
  // Overlap condition: existing.checkIn < requested.checkOut
  //                   AND existing.checkOut > requested.checkIn
  const blockedRooms = await Booking.countDocuments({
    propertyId,
    roomTypeId,
    status: { $in: ["confirmed", "checked_in", "pending"] },
    checkInDate: { $lt: checkOut },
    checkOutDate: { $gt: checkIn },
  });

const availableCount = totalRooms - blockedRooms;

return {
  available: availableCount > 0,  
  availableCount: Math.max(0, availableCount),
  totalRooms,
  blockedRooms,
};
};

// ─────────────────────────────────────────────────────────────────────────────
// CALCULATE PRICING
// Gets room type from property-service and calculates total cost
// ─────────────────────────────────────────────────────────────────────────────
const calculatePricing = async (propertyId, roomTypeId, checkIn, checkOut) => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.ceil(
    (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24),
  );

  // Get room type details from property-service
  let roomType;
  try {
    const res = await axios.get(
      `${process.env.PROPERTY_SERVICE_URL}/api/properties/${propertyId}/room-types`,
      { headers: { "x-internal-service": "booking-service" } },
    );
    roomType = res.data.data.find(
      (rt) => rt._id.toString() === roomTypeId.toString(),
    );
  } catch (err) {
    throw new AppError(
      "Cannot fetch room type details",
      503,
      "SERVICE_UNAVAILABLE",
    );
  }

  if (!roomType) throw new NotFoundError("Room type not found");

  // Calculate price night by night (weekend multiplier)
  let basePrice = 0;
  for (let i = 0; i < nights; i++) {
    const date = new Date(checkInDate);
    date.setDate(date.getDate() + i);
    const day = date.getDay();
    const isWeekend = day === 0 || day === 6;
    const nightPrice = isWeekend
      ? roomType.basePrice * (roomType.weekendMultiplier || 1)
      : roomType.basePrice;
    basePrice += Math.round(nightPrice);
  }

  const taxAmount = Math.round(basePrice * 0.18);
  const totalAmount = basePrice + taxAmount;

  return {
    nights,
    basePrice,
    taxRate: 0.18,
    taxAmount,
    totalAmount,
    currency: "INR",
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// CREATE BOOKING
// ─────────────────────────────────────────────────────────────────────────────
const createBooking = async ({
  guestId,
  propertyId,
  roomTypeId,
  checkInDate,
  checkOutDate,
  adults,
  children,
  specialRequests,
}) => {
  const totalGuests = Number(adults) + Number(children || 0);

  // Step 1: Check availability
  const availability = await checkAvailability({
    propertyId,
    roomTypeId,
    checkInDate,
    checkOutDate,
    guests: totalGuests,
  });

  if (!availability.available) {
    throw new AppError(
      `No rooms available for the selected dates. ${availability.availableCount} rooms remaining.`,
      "NO_AVAILABILITY",
    );
  }

  // Step 2: Calculate pricing
  const pricing = await calculatePricing(
    propertyId,
    roomTypeId,
    checkInDate,
    checkOutDate,
  );

  // Step 3: Create booking document
  const booking = await Booking.create({
    guestId,
    propertyId,
    roomTypeId,
    checkInDate: new Date(checkInDate),
    checkOutDate: new Date(checkOutDate),
    adults: Number(adults),
    children: Number(children || 0),
    specialRequests,
    pricing,
    status: "pending",
    paymentStatus: "pending",
  });

  // Step 4: Clear availability cache in property-service
  try {
    const redis = getRedisClient();
    const keys = await redis.keys("availability:*");
    if (keys.length > 0) await redis.del(...keys);
  } catch (err) {
    // Non-critical
  }

  // Step 5: Publish event for payment-service
  try {
    await publishEvent("booking.created", {
      bookingId: booking._id,
      bookingRef: booking.bookingRef,
      guestId,
      propertyId,
      totalAmount: pricing.totalAmount,
    });
  } catch (err) {
    // Non-critical — booking is created regardless
  }

  return booking;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET GUEST BOOKINGS
// ─────────────────────────────────────────────────────────────────────────────
const getGuestBookings = async (guestId, query = {}) => {
  const { status, page = 1, limit = 10 } = query;

  const filter = { guestId };
  if (status) filter.status = status;

  const total = await Booking.countDocuments(filter);
  const bookings = await Booking.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  return {
    bookings,
    pagination: {
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// GET BOOKING BY ID
// ─────────────────────────────────────────────────────────────────────────────
const getBookingById = async (bookingId, user) => {
  const booking = await Booking.findById(bookingId).lean();
  if (!booking) throw new NotFoundError("Booking not found");

  // Guests can only see their own bookings
  if (
    user.role === "guest" &&
    booking.guestId.toString() !== user._id.toString()
  ) {
    throw new ForbiddenError("You can only view your own bookings");
  }

  return booking;
};

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRM BOOKING (called by payment-service via event)
// ─────────────────────────────────────────────────────────────────────────────
const confirmBooking = async (bookingId, paymentId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new NotFoundError("Booking not found");

  booking.status = "confirmed";
  booking.paymentStatus = "paid";
  booking.paymentId = paymentId;
  await booking.save();

  // Notify guest
  try {
    await publishEvent("booking.confirmed", {
      bookingId: booking._id,
      bookingRef: booking.bookingRef,
      guestId: booking.guestId,
      propertyId: booking.propertyId,
      checkIn: booking.checkInDate,
      checkOut: booking.checkOutDate,
    });
  } catch (err) {
    // Non-critical
  }

  return booking;
};

// ─────────────────────────────────────────────────────────────────────────────
// CHECK IN
// ─────────────────────────────────────────────────────────────────────────────
const checkIn = async (bookingId, roomId, receptionistId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new NotFoundError("Booking not found");

  if (booking.status !== "confirmed") {
    throw new AppError(
      `Cannot check in. Booking status is "${booking.status}"`,
      400,
      "INVALID_STATUS",
    );
  }

  booking.status = "checked_in";
  booking.roomId = roomId;
  booking.actualCheckIn = new Date();
  booking.checkedInBy = receptionistId;
  await booking.save();

  // Tell property-service to mark room as occupied
  try {
    await publishEvent("booking.checkedIn", {
      bookingId: booking._id,
      roomId,
      propertyId: booking.propertyId,
      guestId: booking.guestId,
    });
  } catch (err) {
    // Non-critical
  }

  return booking;
};

// ─────────────────────────────────────────────────────────────────────────────
// CHECK OUT
// ─────────────────────────────────────────────────────────────────────────────
const checkOut = async (bookingId, receptionistId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new NotFoundError("Booking not found");

  if (booking.status !== "checked_in") {
    throw new AppError(
      `Cannot check out. Booking status is "${booking.status}"`,
      400,
      "INVALID_STATUS",
    );
  }

  booking.status = "checked_out";
  booking.actualCheckOut = new Date();
  booking.checkedOutBy = receptionistId;
  await booking.save();

  // Tell property-service to mark room as available + trigger housekeeping
  try {
    await publishEvent("booking.checkedOut", {
      bookingId: booking._id,
      roomId: booking.roomId,
      propertyId: booking.propertyId,
      guestId: booking.guestId,
    });
  } catch (err) {
    // Non-critical
  }

  return booking;
};

// ─────────────────────────────────────────────────────────────────────────────
// CANCEL BOOKING
// ─────────────────────────────────────────────────────────────────────────────
const cancelBooking = async (bookingId, userId, reason, userRole) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new NotFoundError("Booking not found");

  // Guests can only cancel their own bookings
  if (
    userRole === "guest" &&
    booking.guestId.toString() !== userId.toString()
  ) {
    throw new ForbiddenError("You can only cancel your own bookings");
  }

  if (!booking.canBeCancelled()) {
    throw new AppError(
      `Booking cannot be cancelled. Current status: "${booking.status}"`,
      400,
      "CANNOT_CANCEL",
    );
  }

  const refundAmount = booking.getRefundAmount();

  booking.status = "cancelled";
  booking.cancelledAt = new Date();
  booking.cancellationReason = reason;
  booking.cancellationRefundAmount = refundAmount;
  await booking.save();

  // Tell payment-service to process refund
  try {
    await publishEvent("booking.cancelled", {
      bookingId: booking._id,
      bookingRef: booking.bookingRef,
      guestId: booking.guestId,
      refundAmount,
      paymentId: booking.paymentId,
    });
  } catch (err) {
    // Non-critical
  }

  // Clear availability cache
  try {
    const redis = getRedisClient();
    const keys = await redis.keys("availability:*");
    if (keys.length > 0) await redis.del(...keys);
  } catch (err) {
    // Non-critical
  }

  return booking;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET PROPERTY BOOKINGS (for managers)
// ─────────────────────────────────────────────────────────────────────────────
const getPropertyBookings = async (propertyId, query = {}) => {
  const { status, checkIn, checkOut, page = 1, limit = 20 } = query;

  const filter = { propertyId };
  if (status) filter.status = status;
  if (checkIn) filter.checkInDate = { $gte: new Date(checkIn) };
  if (checkOut) filter.checkOutDate = { $lte: new Date(checkOut) };

  const total = await Booking.countDocuments(filter);
  const bookings = await Booking.find(filter)
    .sort({ checkInDate: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  return {
    bookings,
    pagination: {
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  checkAvailability,
  calculatePricing,
  createBooking,
  getGuestBookings,
  getBookingById,
  confirmBooking,
  checkIn,
  checkOut,
  cancelBooking,
  getPropertyBookings,
};
