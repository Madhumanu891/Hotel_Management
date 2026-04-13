const bookingService = require('../services/bookingService');
const asyncHandler   = require('../../../shared/utils/asyncHandler');

const checkAvailability = asyncHandler(async (req, res) => {
  const result = await bookingService.checkAvailability(req.body);
  res.status(200).json({ success: true, data: result });
});

const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking({
    ...req.body,
    guestId: req.user._id,
  });
  res.status(201).json({
    success: true,
    message: 'Booking created. Please complete payment.',
    data:    booking,
  });
});

const getMyBookings = asyncHandler(async (req, res) => {
  const result = await bookingService.getGuestBookings(req.user._id, req.query);
  res.status(200).json({ success: true, ...result });
});

const getBookingById = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.id, req.user);
  res.status(200).json({ success: true, data: booking });
});

const confirmBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.confirmBooking(
    req.params.id, req.body.paymentId
  );
  res.status(200).json({
    success: true,
    message: 'Booking confirmed',
    data:    booking,
  });
});

const checkIn = asyncHandler(async (req, res) => {
  const booking = await bookingService.checkIn(
    req.params.id, req.body.roomId, req.user._id
  );
  res.status(200).json({
    success: true,
    message: 'Check-in successful',
    data:    booking,
  });
});

const checkOut = asyncHandler(async (req, res) => {
  const booking = await bookingService.checkOut(req.params.id, req.user._id);
  res.status(200).json({
    success: true,
    message: 'Check-out successful',
    data:    booking,
  });
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(
    req.params.id,
    req.user._id,
    req.body.reason,
    req.user.role,
  );
  res.status(200).json({
    success: true,
    message: `Booking cancelled. Refund amount: ₹${booking.cancellationRefundAmount}`,
    data:    booking,
  });
});

const getPropertyBookings = asyncHandler(async (req, res) => {
  const result = await bookingService.getPropertyBookings(
    req.params.propertyId, req.query
  );
  res.status(200).json({ success: true, ...result });
});

module.exports = {
  checkAvailability,
  createBooking,
  getMyBookings,
  getBookingById,
  confirmBooking,
  checkIn,
  checkOut,
  cancelBooking,
  getPropertyBookings,
};