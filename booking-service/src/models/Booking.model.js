const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({

  // Auto-generated reference number shown to guests
  // Format: BK-2026-ABC123
  bookingRef: {
    type:   String,
    unique: true,
  },

  // Who made this booking
  guestId: {
    type:     mongoose.Schema.Types.ObjectId,
    required: [true, 'Guest ID is required'],
    index:    true,
  },

  // Which hotel
  propertyId: {
    type:     mongoose.Schema.Types.ObjectId,
    required: [true, 'Property ID is required'],
    index:    true,
  },

  // Which room type was booked
  roomTypeId: {
    type:     mongoose.Schema.Types.ObjectId,
    required: [true, 'Room type ID is required'],
    index:    true,
  },

  // Which actual room was assigned (set at check-in)
  roomId: {
    type:    mongoose.Schema.Types.ObjectId,
    default: null,
  },

  // Stay dates
  checkInDate: {
    type:     Date,
    required: [true, 'Check-in date is required'],
  },

  checkOutDate: {
    type:     Date,
    required: [true, 'Check-out date is required'],
  },

  // Guest count
  adults: {
    type:    Number,
    default: 1,
    min:     [1, 'At least 1 adult required'],
  },

  children: {
    type:    Number,
    default: 0,
    min:     [0, 'Children cannot be negative'],
  },

  // Booking lifecycle status
  // pending    → created, awaiting payment
  // confirmed  → payment received
  // checked_in → guest has arrived and checked in
  // checked_out → guest has left
  // cancelled  → booking was cancelled
  // no_show    → guest did not arrive
  status: {
    type:    String,
    enum:    ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'],
    default: 'pending',
    index:   true,
  },

  // Complete pricing breakdown
  pricing: {
    basePrice:   { type: Number, required: true },
    taxRate:     { type: Number, default: 0.18 },
    taxAmount:   { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    currency:    { type: String, default: 'INR' },
  },

  // Guest special requests
  specialRequests: {
    type: String,
    maxlength: [500, 'Special requests cannot exceed 500 characters'],
  },

  // Payment tracking
  paymentStatus: {
    type:    String,
    enum:    ['pending', 'paid', 'refunded', 'partial_refund', 'failed'],
    default: 'pending',
  },

  paymentId: {
    type: String, // Reference from payment-service
  },

  // Cancellation details
  cancelledAt: {
    type: Date,
  },

  cancellationReason: {
    type: String,
  },

  cancellationRefundAmount: {
    type: Number,
  },

  // Actual check-in/out timestamps
  actualCheckIn:  { type: Date },
  actualCheckOut: { type: Date },

  // Who performed check-in (receptionist userId)
  checkedInBy:  { type: mongoose.Schema.Types.ObjectId },
  checkedOutBy: { type: mongoose.Schema.Types.ObjectId },

}, { timestamps: true });

// ── Indexes ───────────────────────────────────────────────────────────────────

// Most common query: find bookings for a property within date range
bookingSchema.index({ propertyId: 1, checkInDate: 1, checkOutDate: 1 });

// Availability check query
bookingSchema.index({ roomTypeId: 1, status: 1, checkInDate: 1, checkOutDate: 1 });

// Guest booking history
bookingSchema.index({ guestId: 1, status: 1, createdAt: -1 });

// Unique booking reference
bookingSchema.index({ bookingRef: 1 }, { unique: true });

// ── Pre-save: auto-generate booking reference ─────────────────────────────────
bookingSchema.pre('save', async function () {
  if (this.bookingRef) return; // Already has a ref

  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).substr(2, 6).toUpperCase();
  this.bookingRef = `BK-${year}-${rand}`;
});

// ── Virtual: nights ───────────────────────────────────────────────────────────
bookingSchema.virtual('nights').get(function () {
  return Math.ceil(
    (this.checkOutDate - this.checkInDate) / (1000 * 60 * 60 * 24)
  );
});

// ── Instance method: can be cancelled? ───────────────────────────────────────
bookingSchema.methods.canBeCancelled = function () {
  return ['pending', 'confirmed'].includes(this.status);
};

// ── Instance method: is refundable? ──────────────────────────────────────────
// Full refund if cancelled more than 24 hours before check-in
bookingSchema.methods.getRefundAmount = function (cancellationPolicyHours = 24) {
  if (!this.canBeCancelled()) return 0;

  const hoursUntilCheckIn =
    (this.checkInDate - Date.now()) / (1000 * 60 * 60);

  if (hoursUntilCheckIn >= cancellationPolicyHours) {
    return this.pricing.totalAmount; // Full refund
  } else if (hoursUntilCheckIn >= cancellationPolicyHours / 2) {
    return this.pricing.totalAmount * 0.5; // 50% refund
  } else {
    return 0; // No refund
  }
};

module.exports = mongoose.model('Booking', bookingSchema);