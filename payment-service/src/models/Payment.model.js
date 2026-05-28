const mongoose = require("mongoose");

const refundSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    reason: { type: String },
    gatewayRefundId: { type: String },
    processedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  { _id: false },
);

const paymentSchema = new mongoose.Schema(
  {
    // Auto-generated reference
    paymentRef: {
      type: String,
      unique: true,
    },

    // Which booking this pays for
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    bookingRef: {
      type: String,
      index: true,
    },

    // Who paid
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    // Amount in INR
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    // Payment method used
    method: {
      type: String,
      enum: ["paypal", "card", "upi", "cash", "bank_transfer"],
      default: "paypal",
    },

    // Payment lifecycle
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
        "partial_refund",
      ],
      default: "pending",
      index: true,
    },

    // PayPal specific
    gatewayOrderId: { type: String }, // PayPal order ID
    gatewayPaymentId: { type: String }, // PayPal capture ID
    gatewayResponse: { type: mongoose.Schema.Types.Mixed }, // Full PayPal response

    // Refunds
    refunds: [refundSchema],

    // Invoice
    invoiceUrl: { type: String },

    // Failure reason
    failureReason: { type: String },
  },
  { timestamps: true },
);

// Auto-generate payment reference
paymentSchema.pre("save", function (next) {
  if (this.paymentRef) return next();

  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).substr(2, 6).toUpperCase();

  this.paymentRef = `PAY-${year}-${rand}`;

  next();
});
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ guestId: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Payment", paymentSchema);
