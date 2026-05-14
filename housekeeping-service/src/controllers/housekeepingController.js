const housekeepingService = require('../services/housekeepingService');
const asyncHandler        = require('../../../shared/utils/asyncHandler');

const createTask = asyncHandler(async (req, res) => {
  const task = await housekeepingService.createTask(req.body);
  res.status(201).json({ success: true, message: 'Task created', data: task });
});

const getPropertyTasks = asyncHandler(async (req, res) => {
  const result = await housekeepingService.getPropertyTasks(
    req.params.propertyId, req.query
  );
  res.status(200).json({ success: true, ...result });
});

const getMyTasks = asyncHandler(async (req, res) => {
  const result = await housekeepingService.getMyTasks(req.user._id, req.query);
  res.status(200).json({ success: true, ...result });
});

const startTask = asyncHandler(async (req, res) => {
  const task = await housekeepingService.startTask(req.params.id, req.user._id);
  res.status(200).json({ success: true, message: 'Task started', data: task });
});

const completeTask = asyncHandler(async (req, res) => {
  const task = await housekeepingService.completeTask(
    req.params.id, req.user._id, req.body
  );
  res.status(200).json({ success: true, message: 'Task completed', data: task });
});

const verifyTask = asyncHandler(async (req, res) => {
  const task = await housekeepingService.verifyTask(req.params.id, req.user._id);
  res.status(200).json({ success: true, message: 'Task verified', data: task });
});

const updateChecklistItem = asyncHandler(async (req, res) => {
  const { item, done } = req.body;
  const task = await housekeepingService.updateChecklistItem(req.params.id, item, done);
  res.status(200).json({ success: true, data: task });
});

const assignTask = asyncHandler(async (req, res) => {
  const task = await housekeepingService.assignTask(req.params.id, req.body.staffId);
  res.status(200).json({ success: true, message: 'Task assigned', data: task });
});

const getTaskStats = asyncHandler(async (req, res) => {
  const stats = await housekeepingService.getTaskStats(req.params.propertyId);
  res.status(200).json({ success: true, data: stats });
});

module.exports = {
  createTask,
  getPropertyTasks,
  getMyTasks,
  startTask,
  completeTask,
  verifyTask,
  updateChecklistItem,
  assignTask,
  getTaskStats,
};