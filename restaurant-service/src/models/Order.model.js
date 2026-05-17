const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItemId:   { type: mongoose.Schema.Types.ObjectId, required: true },
  name:         { type: String, required: true }, // snapshot at time of order
  price:        { type: Number, required: true }, // snapshot at time of order
  quantity:     { type: Number, required: true, min: 1 },
  subtotal:     { type: Number, required: true },
  notes:        { type: String }, // e.g. "no onions"
}, { _id: false });

const orderSchema = new mongoose.Schema({

  orderRef: {
    type:   String,
    unique: true,
  },

  propertyId: {
    type:     mongoose.Schema.Types.ObjectId,
    required: true,
    index:    true,
  },

  // Who ordered
  guestId: {
    type:  mongoose.Schema.Types.ObjectId,
    index: true,
  },

  // Room service or table
  orderType: {
    type:    String,
    enum:    ['room_service', 'dine_in', 'takeaway'],
    default: 'room_service',
  },

  roomNumber:  { type: String }, // for room service
  tableNumber: { type: String }, // for dine-in

  // Items ordered
  items: [orderItemSchema],

  // Totals
  subtotal:    { type: Number, required: true },
  taxAmount:   { type: Number, required: true },
  totalAmount: { type: Number, required: true },

  // Order lifecycle
  // placed → preparing → ready → delivered / cancelled
  status: {
    type:    String,
    enum:    ['placed', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'placed',
    index:   true,
  },

  // Special instructions
  specialInstructions: { type: String },

  // Timestamps
  confirmedAt: { type: Date },
  preparingAt: { type: Date },
  readyAt:     { type: Date },
  deliveredAt: { type: Date },

  // Estimated delivery time in minutes
  estimatedTime: { type: Number },

}, { timestamps: true });

// Auto-generate order reference
orderSchema.pre('save', function () {
  if (this.orderRef) return;
  const rand = Math.random().toString(36).substr(2, 6).toUpperCase();
  this.orderRef = `ORD-${Date.now()}-${rand}`;
});

orderSchema.index({ propertyId: 1, status: 1, createdAt: -1 });
orderSchema.index({ guestId: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);