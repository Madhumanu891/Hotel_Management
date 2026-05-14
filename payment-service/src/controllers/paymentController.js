const paymentService = require('../services/paymentService');
const asyncHandler   = require('../../../shared/utils/asyncHandler');

const createOrder = asyncHandler(async (req, res) => {
  const { bookingId, bookingRef, amount } = req.body;

  const result = await paymentService.createPayPalOrder({
    bookingId,
    bookingRef,
    guestId: req.user._id,
    amount,
  });

  res.status(200).json({
    success: true,
    message: 'PayPal order created. Redirect user to approvalUrl.',
    data:    result,
  });
});

const capturePayment = asyncHandler(async (req, res) => {
  const { orderId, bookingId } = req.body;

  const payment = await paymentService.capturePayPalPayment({ orderId, bookingId });

  res.status(200).json({
    success: true,
    message: 'Payment captured successfully',
    data:    payment,
  });
});

const processRefund = asyncHandler(async (req, res) => {
  const { amount, reason } = req.body;

  const payment = await paymentService.processRefund({
    paymentId: req.params.id,
    amount,
    reason,
  });

  res.status(200).json({
    success: true,
    message: 'Refund processed successfully',
    data:    payment,
  });
});

const getPaymentByBooking = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPaymentByBooking(req.params.bookingId);
  res.status(200).json({ success: true, data: payment });
});

const getMyPayments = asyncHandler(async (req, res) => {
  const result = await paymentService.getGuestPayments(req.user._id, req.query);
  res.status(200).json({ success: true, ...result });
});

module.exports = {
  createOrder,
  capturePayment,
  processRefund,
  getPaymentByBooking,
  getMyPayments,
};