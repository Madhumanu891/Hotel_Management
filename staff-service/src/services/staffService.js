const Shift        = require('../models/Shift.model');
const LeaveRequest = require('../models/LeaveRequest.model');
const { publishEvent } = require('../../../shared/events/rabbitmq');
const {
  NotFoundError,
  AppError,
  ConflictError,
} = require('../../../shared/errors');

// ── Shift Management ──────────────────────────────────────────────────────────

const createShift = async ({
  propertyId,
  staffId,
  staffName,
  staffRole,
  department,
  date,
  startTime,
  endTime,
  notes,
  createdBy,
}) => {
  // Check if staff already has a shift on this date
  const shiftDate = new Date(date);
  shiftDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(shiftDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const existing = await Shift.findOne({
    staffId,
    date: { $gte: shiftDate, $lt: nextDay },
  });

  if (existing) {
    throw new ConflictError(
      `${staffName || 'Staff'} already has a shift on this date`
    );
  }

  // Calculate duration in hours
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH,   endM]   = endTime.split(':').map(Number);
  const duration = ((endH * 60 + endM) - (startH * 60 + startM)) / 60;

  const shift = await Shift.create({
    propertyId,
    staffId,
    staffName,
    staffRole,
    department,
    date: new Date(date),
    startTime,
    endTime,
    duration,
    notes,
    createdBy,
  });

  return shift;
};

const getPropertyShifts = async (propertyId, query = {}) => {
  const { date, week, department, staffId, page = 1, limit = 50 } = query;

  const filter = { propertyId };
  if (staffId)    filter.staffId    = staffId;
  if (department) filter.department = department;

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    filter.date = { $gte: start, $lte: end };
  } else if (week) {
    // Get shifts for entire week
    const weekStart = new Date(week);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    filter.date = { $gte: weekStart, $lte: weekEnd };
  }

  const total  = await Shift.countDocuments(filter);
  const shifts = await Shift
    .find(filter)
    .sort({ date: 1, startTime: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  return {
    shifts,
    pagination: { total, page: Number(page), totalPages: Math.ceil(total / limit) },
  };
};

const getMyShifts = async (staffId, query = {}) => {
  const { page = 1, limit = 20 } = query;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filter = {
    staffId,
    date: { $gte: today },
  };

  const total  = await Shift.countDocuments(filter);
  const shifts = await Shift
    .find(filter)
    .sort({ date: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  return {
    shifts,
    pagination: { total, page: Number(page), totalPages: Math.ceil(total / limit) },
  };
};

const updateShiftStatus = async (shiftId, status, notes) => {
  const shift = await Shift.findById(shiftId);
  if (!shift) throw new NotFoundError('Shift not found');

  shift.status = status;
  if (notes) shift.notes = notes;
  await shift.save();

  return shift;
};

const createWeeklySchedule = async (propertyId, department, weekStart, staffList, createdBy) => {
  const shifts = [];
  const errors = [];

  for (let day = 0; day < 7; day++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + day);

    for (let i = 0; i < staffList.length; i++) {
      const staff = staffList[i];
      // Alternate between morning (08:00-16:00) and evening (16:00-00:00) shifts
      const isMorning = i % 2 === 0;

      try {
        const shift = await createShift({
          propertyId,
          staffId:    staff.staffId,
          staffName:  staff.name,
          staffRole:  staff.role,
          department,
          date,
          startTime:  isMorning ? '08:00' : '16:00',
          endTime:    isMorning ? '16:00' : '00:00',
          createdBy,
        });
        shifts.push(shift);
      } catch (err) {
        // Skip duplicates, collect other errors
        if (err.code !== 'CONFLICT') errors.push({ staff: staff.name, date, error: err.message });
      }
    }
  }

  return { shifts, errors, totalCreated: shifts.length };
};

// ── Leave Management ──────────────────────────────────────────────────────────

const applyForLeave = async ({
  propertyId,
  staffId,
  staffName,
  leaveType,
  fromDate,
  toDate,
  reason,
}) => {
  const from = new Date(fromDate);
  const to   = new Date(toDate);

  if (from > to) {
    throw new AppError('From date must be before to date', 400, 'INVALID_DATE');
  }

  // Calculate number of days
  const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

  // Check for overlapping leave requests
  const overlapping = await LeaveRequest.findOne({
    staffId,
    status:   { $ne: 'rejected' },
    fromDate: { $lte: to },
    toDate:   { $gte: from },
  });

  if (overlapping) {
    throw new ConflictError('You already have a leave request for overlapping dates');
  }

  const leave = await LeaveRequest.create({
    propertyId,
    staffId,
    staffName,
    leaveType,
    fromDate: from,
    toDate:   to,
    days,
    reason,
    status: 'pending',
  });

  return leave;
};

const getLeaveRequests = async (propertyId, query = {}) => {
  const { status, staffId, page = 1, limit = 20 } = query;

  const filter = { propertyId };
  if (status)  filter.status  = status;
  if (staffId) filter.staffId = staffId;

  const total    = await LeaveRequest.countDocuments(filter);
  const requests = await LeaveRequest
    .find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  return {
    requests,
    pagination: { total, page: Number(page), totalPages: Math.ceil(total / limit) },
  };
};

const reviewLeaveRequest = async (leaveId, status, reviewedBy, reviewNotes) => {
  const leave = await LeaveRequest.findById(leaveId);
  if (!leave) throw new NotFoundError('Leave request not found');

  if (leave.status !== 'pending') {
    throw new AppError('This leave request has already been reviewed', 400, 'ALREADY_REVIEWED');
  }

  leave.status      = status;
  leave.reviewedBy  = reviewedBy;
  leave.reviewedAt  = new Date();
  leave.reviewNotes = reviewNotes;
  await leave.save();

  // Notify staff member
  try {
    await publishEvent('leave.reviewed', {
      leaveId:   leave._id,
      staffId:   leave.staffId,
      status,
      leaveType: leave.leaveType,
      fromDate:  leave.fromDate,
      toDate:    leave.toDate,
    });
  } catch (err) {
    // Non-critical
  }

  return leave;
};

const getMyLeaveRequests = async (staffId) => {
  const requests = await LeaveRequest
    .find({ staffId })
    .sort({ createdAt: -1 })
    .lean();

  return requests;
};

// ── Staff Statistics ──────────────────────────────────────────────────────────

const getStaffStats = async (propertyId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [onDutyToday, pendingLeaves, scheduledToday] = await Promise.all([
    Shift.countDocuments({
      propertyId,
      date:   { $gte: today, $lt: tomorrow },
      status: { $in: ['scheduled', 'confirmed'] },
    }),
    LeaveRequest.countDocuments({ propertyId, status: 'pending' }),
    Shift.countDocuments({ propertyId, date: { $gte: today, $lt: tomorrow } }),
  ]);

  return { onDutyToday, pendingLeaves, scheduledToday };
};

module.exports = {
  createShift,
  getPropertyShifts,
  getMyShifts,
  updateShiftStatus,
  createWeeklySchedule,
  applyForLeave,
  getLeaveRequests,
  reviewLeaveRequest,
  getMyLeaveRequests,
  getStaffStats,
};