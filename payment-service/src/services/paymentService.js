const paypal = require("@paypal/checkout-server-sdk");
const Payment = require("../models/Payment.model");
const { getPayPalClient } = require("../config/paypal");
const { publishEvent } = require("../../../shared/events/rabbitmq");
const { NotFoundError, AppError } = require("../../../shared/errors");

// ─────────────────────────────────────────────────────────────────────────────
// createPayPalOrder
// Creates a real PayPal order and saves payment record to DB
// Returns approvalUrl for redirecting the user to PayPal
// ─────────────────────────────────────────────────────────────────────────────
const createPayPalOrder = async ({
  bookingId,
  bookingRef,
  guestId,
  amount,
}) => {
  // Create payment record in DB first
  const paymentRef = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

  let payment = await Payment.findOne({ bookingId, status: "pending" });

  if (!payment) {
    payment = await Payment.create({
      bookingId,
      bookingRef,
      guestId,
      amount,
      currency: "INR",
      method: "paypal",
      status: "pending",
      paymentRef,
    });
  }

  // Skip real PayPal in development if credentials not set
  if (
    !process.env.PAYPAL_CLIENT_ID ||
    process.env.PAYPAL_CLIENT_ID === "your_paypal_client_id"
  ) {
    return {
      paymentId: payment._id,
      paymentRef: payment.paymentRef,
      orderId: `MOCK-ORDER-${Date.now()}`,
      approvalUrl: null,
      isDev: true,
    };
  }

  try {
    const client = getPayPalClient();
    const request = new paypal.orders.OrdersCreateRequest();

    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      application_context: {
        brand_name: "NexoraHotels",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",

        return_url: `${process.env.CLIENT_URL}/payment/success?bookingId=${bookingId}`,

        cancel_url: `${process.env.CLIENT_URL}/payment/cancel?bookingId=${bookingId}`,
      },
      purchase_units: [
        {
          reference_id: bookingRef,
          description: `Hotel booking ${bookingRef} - NexoraHotels`,
          amount: {
            currency_code: "USD", // PayPal sandbox works best with USD
            value: (amount / 83).toFixed(2), // Convert INR to USD approx
          },
          custom_id: payment._id.toString(),
        },
      ],
    });

    const order = await client.execute(request);

    // Save PayPal order ID
    payment.gatewayOrderId = order.result.id;
    await payment.save();

    // Get approval URL for redirect
    const approvalUrl = order.result.links.find(
      (l) => l.rel === "approve",
    )?.href;

    return {
      paymentId: payment._id,
      paymentRef: payment.paymentRef,
      orderId: order.result.id,
      approvalUrl,
      isDev: false,
    };
  } catch (err) {
    // PayPal API error — fall back to mock
    console.error("PayPal create order failed:", err.message);
    return {
      paymentId: payment._id,
      paymentRef: payment.paymentRef,
      orderId: `MOCK-ORDER-${Date.now()}`,
      approvalUrl: null,
      isDev: true,
    };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// capturePayPalPayment
// Called after user approves payment on PayPal
// Captures the authorized payment and marks it complete
// ─────────────────────────────────────────────────────────────────────────────
const capturePayPalPayment = async ({ orderId, bookingId }) => {
  const payment = await Payment.findOne({
    $or: [{ gatewayOrderId: orderId }, { bookingId }],
  });

  if (!payment) throw new NotFoundError("Payment record not found");

  try {
    const client = getPayPalClient();
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const capture = await client.execute(request);

    const captureId =
      capture.result.purchase_units[0]?.payments?.captures?.[0]?.id;

    payment.status = "completed";
    payment.gatewayPaymentId = captureId || orderId;
    payment.paidAt = new Date();
    await payment.save();

    // Publish event
    await publishEvent("payment.completed", {
      bookingId: payment.bookingId,
      paymentId: payment._id,
      paymentRef: payment.paymentRef,
      amount: payment.amount,
      guestId: payment.guestId,
    });

    return payment;
  } catch (err) {
    payment.status = "failed";
    await payment.save();
    throw new AppError(
      `PayPal capture failed: ${err.message}`,
      400,
      "PAYMENT_FAILED",
    );
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// processRefund
// Issues a full or partial refund via PayPal
// ─────────────────────────────────────────────────────────────────────────────
const processRefund = async ({ paymentId, amount, reason }) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new NotFoundError("Payment not found");

  if (payment.status !== "completed") {
    throw new AppError(
      "Can only refund completed payments",
      400,
      "INVALID_STATUS",
    );
  }

  try {
    const client = getPayPalClient();
    const request = new paypal.payments.CapturesRefundRequest(
      payment.gatewayPaymentId,
    );

    request.requestBody({
      amount: {
        currency_code: "USD",
        value: (amount / 83).toFixed(2),
      },
      note_to_payer: reason || "Booking cancellation refund",
    });

    await client.execute(request);

    payment.status = "refunded";
    payment.refundAmount = amount;
    payment.refundReason = reason;
    payment.refundedAt = new Date();
    await payment.save();

    await publishEvent("payment.refunded", {
      bookingId: payment.bookingId,
      paymentId: payment._id,
      amount,
      reason,
    });

    return payment;
  } catch (err) {
    throw new AppError(`Refund failed: ${err.message}`, 400, "REFUND_FAILED");
  }
};

const getPaymentByBooking = async (bookingId) => {
  const payment = await Payment.findOne({ bookingId });
  if (!payment) throw new NotFoundError("Payment not found");
  return payment;
};

const getGuestPayments = async (guestId, query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    Payment.find({ guestId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Payment.countDocuments({ guestId }),
  ]);

  return {
    payments,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

module.exports = {
  createPayPalOrder,
  capturePayPalPayment,
  processRefund,
  getPaymentByBooking,
  getGuestPayments,
};
