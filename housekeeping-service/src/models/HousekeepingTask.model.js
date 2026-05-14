const mongoose = require('mongoose');

const checklistItemSchema = new mongoose.Schema({
  item: { type: String, required: true },
  done: { type: Boolean, default: false },
}, { _id: false });

const housekeepingTaskSchema = new mongoose.Schema({

  propertyId: {
    type:     mongoose.Schema.Types.ObjectId,
    required: true,
    index:    true,
  },

  roomId: {
    type:     mongoose.Schema.Types.ObjectId,
    required: true,
    index:    true,
  },

  roomNumber: {
    type: String,
  },

  // Who is assigned to clean
  assignedTo: {
    type:  mongoose.Schema.Types.ObjectId,
    index: true,
  },

  // Task type
  type: {
    type:    String,
    enum:    ['checkout_clean', 'stayover', 'deep_clean', 'inspection', 'maintenance'],
    default: 'checkout_clean',
  },

  // Priority level
  priority: {
    type:    String,
    enum:    ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
  },

  // Task lifecycle status
  status: {
    type:    String,
    enum:    ['pending', 'in_progress', 'completed', 'verified', 'skipped'],
    default: 'pending',
    index:   true,
  },

  // When to perform
  scheduledFor: {
    type:    Date,
    default: Date.now,
  },

  // Actual timestamps
  startedAt:   { type: Date },
  completedAt: { type: Date },

  // How long it took in minutes
  duration: {
    type: Number,
  },

  // Standard checklist items
  checklist: [checklistItemSchema],

  // Notes
  notes: { type: String },

  // After-clean photos
  photos: [{ type: String }],

  // Booking that triggered this task
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
  },

}, { timestamps: true });

housekeepingTaskSchema.index({ propertyId: 1, status: 1 });
housekeepingTaskSchema.index({ assignedTo: 1, status: 1 });
housekeepingTaskSchema.index({ roomId: 1, createdAt: -1 });

module.exports = mongoose.model('HousekeepingTask', housekeepingTaskSchema);