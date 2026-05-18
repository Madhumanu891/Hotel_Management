const staffService = require('../services/staffService');
const asyncHandler = require('../../../shared/utils/asyncHandler');

// Shifts
const createShift          = asyncHandler(async (req, res) => {
  const shift = await staffService.createShift({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, data: shift });
});

const getPropertyShifts    = asyncHandler(async (req, res) => {
  const result = await staffService.getPropertyShifts(req.params.propertyId, req.query);
  res.status(200).json({ success: true, ...result });
});

const getMyShifts          = asyncHandler(async (req, res) => {
  const result = await staffService.getMyShifts(req.user._id, req.query);
  res.status(200).json({ success: true, ...result });
});

const updateShiftStatus    = asyncHandler(async (req, res) => {
  const shift = await staffService.updateShiftStatus(
    req.params.shiftId, req.body.status, req.body.notes
  );
  res.status(200).json({ success: true, data: shift });
});

const createWeeklySchedule = asyncHandler(async (req, res) => {
  const result = await staffService.createWeeklySchedule(
    req.params.propertyId,
    req.body.department,
    req.body.weekStart,
    req.body.staffList,
    req.user._id
  );
  res.status(201).json({ success: true, ...result });
});

const getStaffStats        = asyncHandler(async (req, res) => {
  const stats = await staffService.getStaffStats(req.params.propertyId);
  res.status(200).json({ success: true, data: stats });
});

// Leave
const applyForLeave        = asyncHandler(async (req, res) => {
  const leave = await staffService.applyForLeave({
    ...req.body,
    staffId: req.user._id,
  });
  res.status(201).json({ success: true, message: 'Leave request submitted', data: leave });
});

const getLeaveRequests     = asyncHandler(async (req, res) => {
  const result = await staffService.getLeaveRequests(req.params.propertyId, req.query);
  res.status(200).json({ success: true, ...result });
});

const reviewLeaveRequest   = asyncHandler(async (req, res) => {
  const leave = await staffService.reviewLeaveRequest(
    req.params.leaveId,
    req.body.status,
    req.user._id,
    req.body.notes
  );
  res.status(200).json({ success: true, data: leave });
});

const getMyLeaveRequests   = asyncHandler(async (req, res) => {
  const requests = await staffService.getMyLeaveRequests(req.user._id);
  res.status(200).json({ success: true, data: requests });
});

module.exports = {
  createShift, getPropertyShifts, getMyShifts,
  updateShiftStatus, createWeeklySchedule, getStaffStats,
  applyForLeave, getLeaveRequests, reviewLeaveRequest, getMyLeaveRequests,
};