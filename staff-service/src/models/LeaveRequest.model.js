const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({

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

  staffName: { type: String },

  leaveType: {
    type:    String,
    enum:    ['annual', 'sick', 'emergency', 'maternity', 'paternity', 'unpaid'],
    required: true,
  },

  fromDate: {
    type:     Date,
    required: true,
  },

  toDate: {
    type:     Date,
    required: true,
  },

  // Number of days
  days: {
    type: Number,
  },

  reason: {
    type:      String,
    required:  true,
    maxlength: 500,
  },

  status: {
    type:    String,
    enum:    ['pending', 'approved', 'rejected'],
    default: 'pending',
    index:   true,
  },

  // Who approved/rejected
  reviewedBy:  { type: mongoose.Schema.Types.ObjectId },
  reviewedAt:  { type: Date },
  reviewNotes: { type: String },

}, { timestamps: true });

leaveRequestSchema.index({ propertyId: 1, status: 1 });
leaveRequestSchema.index({ staffId: 1, fromDate: 1 });

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);