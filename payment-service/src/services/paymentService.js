const paypal   = require('@paypal/checkout-server-sdk');
const axios    = require('axios');
const Payment  = require('../models/Payment.model');
const { getPayPalClient } = require('../utils/paypalClient');
const { publishEvent }    = require('../../../shared/events/rabbitmq');
const {
  AppError,
  NotFoundError,
} = require('../../../shared/errors');

// INR to USD conversion (PayPal sandbox works best in USD)
const INR_TO_USD = 0.012;

const inrToUsd = (inr) => (inr * INR_TO_USD).toFixed(2);

// ─────────────────────────────────────────────────────────────────────────────
// CREATE PAYPAL ORDER
// Step 1 of the PayPal flow
// Returns an approval URL — frontend redirects user here
// ─────────────────────────────────────────────────────────────────────────────
const createPayPalOrder = async ({ bookingId, bookingRef, guestId, amount }) => {

  // Check if payment already exists for this booking
  const existing = await Payment.findOne({ bookingId, status: { $in: ['pending', 'completed'] } });
  if (existing && existing.status === 'completed') {
    throw new AppError('This booking has already been paid', 400, 'ALREADY_PAID');
  }

  const amountUsd = inrToUsd(amount);

  // Create PayPal order
  const request = new paypal.orders.OrdersCreateRequest();
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'USD',
        value:         amountUsd,
      },
      description: `NexoraHotels Booking ${bookingRef}`,
      custom_id:   bookingId.toString(),
    }],
    application_context: {
      brand_name:          'NexoraHotels',
      landing_page:        'BILLING',
      user_action:         'PAY_NOW',
      return_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/success`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/cancel`,
    },
  });

  const response = await getPayPalClient().execute(request);

  // Get approval URL from PayPal response
  const approvalUrl = response.result.links
    .find(link => link.rel === 'approve')?.href;

  if (!approvalUrl) {
    throw new AppError('Could not get PayPal approval URL', 500, 'PAYPAL_ERROR');
  }

  // Create or update payment record
  const payment = await Payment.findOneAndUpdate(
    { bookingId },
    {
      bookingId,
      bookingRef,
      guestId,
      amount,
      method:         'paypal',
      status:         'pending',
      gatewayOrderId: response.result.id,
    },
    { upsert: true, new: true }
  );

  return {
    paymentId:   payment._id,
    paymentRef:  payment.paymentRef,
    orderId:     response.result.id,
    approvalUrl,
    amount,
    amountUsd,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// CAPTURE PAYPAL PAYMENT
// Step 2 — called after user approves payment on PayPal
// ─────────────────────────────────────────────────────────────────────────────
const capturePayPalPayment = async ({ orderId, bookingId }) => {

  const payment = await Payment.findOne({ gatewayOrderId: orderId });
  if (!payment) throw new NotFoundError('Payment record not found');

  // Capture the payment from PayPal
  const request  = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  let captureResponse;
  try {
    captureResponse = await getPayPalClient().execute(request);
  } catch (err) {
    // Update payment as failed
    payment.status        = 'failed';
    payment.failureReason = err.message;
    await payment.save();

    throw new AppError('Payment capture failed. Please try again.', 400, 'CAPTURE_FAILED');
  }

  const captureId = captureResponse.result.purchase_units[0]
    ?.payments?.captures[0]?.id;

  // Update payment record
  payment.status           = 'completed';
  payment.gatewayPaymentId = captureId;
  payment.gatewayResponse  = captureResponse.result;
  await payment.save();

  // Tell booking-service to confirm the booking
  try {
    await publishEvent('payment.completed', {
      bookingId:  payment.bookingId,
      paymentId:  payment._id,
      paymentRef: payment.paymentRef,
      amount:     payment.amount,
      guestId:    payment.guestId,
    });
  } catch (err) {
    // Non-critical
  }

  return payment;
};

// ─────────────────────────────────────────────────────────────────────────────
// PROCESS REFUND
// ─────────────────────────────────────────────────────────────────────────────
const processRefund = async ({ paymentId, amount, reason }) => {

  const payment = await Payment.findById(paymentId);
  if (!payment) throw new NotFoundError('Payment not found');

  if (payment.status !== 'completed') {
    throw new AppError('Only completed payments can be refunded', 400, 'NOT_REFUNDABLE');
  }

  if (!payment.gatewayPaymentId) {
    throw new AppError('No PayPal capture ID found for this payment', 400, 'NO_CAPTURE_ID');
  }

  const refundAmount    = amount || payment.amount;
  const refundAmountUsd = inrToUsd(refundAmount);

  // Create PayPal refund
  const request = new paypal.payments.CapturesRefundRequest(payment.gatewayPaymentId);
  request.requestBody({
    amount: {
      currency_code: 'USD',
      value:         refundAmountUsd,
    },
    note_to_payer: reason || 'Booking cancellation refund',
  });

  let refundResponse;
  try {
    refundResponse = await getPayPalClient().execute(request);
  } catch (err) {
    throw new AppError('Refund failed. Please try again.', 400, 'REFUND_FAILED');
  }

  // Add refund record
  payment.refunds.push({
    amount:          refundAmount,
    reason,
    gatewayRefundId: refundResponse.result.id,
    status:          'completed',
  });

  // Update status
  const totalRefunded = payment.refunds.reduce((sum, r) => sum + r.amount, 0);
  payment.status = totalRefunded >= payment.amount ? 'refunded' : 'partial_refund';
  await payment.save();

  // Notify other services
  try {
    await publishEvent('payment.refunded', {
      bookingId:  payment.bookingId,
      paymentId:  payment._id,
      amount:     refundAmount,
      guestId:    payment.guestId,
    });
  } catch (err) {
    // Non-critical
  }

  return payment;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET PAYMENT BY BOOKING ID
// ─────────────────────────────────────────────────────────────────────────────
const getPaymentByBooking = async (bookingId) => {
  const payment = await Payment.findOne({ bookingId }).lean();
  if (!payment) throw new NotFoundError('Payment not found for this booking');
  return payment;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET GUEST PAYMENTS
// ─────────────────────────────────────────────────────────────────────────────
const getGuestPayments = async (guestId, query = {}) => {
  const { page = 1, limit = 10 } = query;
  const total    = await Payment.countDocuments({ guestId });
  const payments = await Payment
    .find({ guestId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  return {
    payments,
    pagination: {
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  createPayPalOrder,
  capturePayPalPayment,
  processRefund,
  getPaymentByBooking,
  getGuestPayments,
};