const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({

  propertyId: {
    type:     mongoose.Schema.Types.ObjectId,
    required: true,
    index:    true,
  },

  staffId: {
    type:     mongoose.Schema.Types.ObjectId,
    required: true,
    index:    true,
  },

  // Staff details snapshot
  staffName:   { type: String },
  staffRole:   { type: String },
  department:  { type: String },

  // Shift timing
  date: {
    type:     Date,
    required: true,
  },

  startTime: {
    type:     String,
    required: true,
    // e.g. "08:00"
  },

  endTime: {
    type:     String,
    required: true,
    // e.g. "16:00"
  },

  // Duration in hours
  duration: {
    type: Number,
  },

  // Shift status
  status: {
    type:    String,
    enum:    ['scheduled', 'confirmed', 'completed', 'absent', 'swapped'],
    default: 'scheduled',
  },

  // Overtime hours
  overtime: {
    type:    Number,
    default: 0,
  },

  notes: { type: String },

  // Who created this shift
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
  },

}, { timestamps: true });

// One staff member cannot have two shifts on the same date
shiftSchema.index({ staffId: 1, date: 1 });
shiftSchema.index({ propertyId: 1, date: 1 });
shiftSchema.index({ propertyId: 1, department: 1, date: 1 });

module.exports = mongoose.model('Shift', shiftSchema);