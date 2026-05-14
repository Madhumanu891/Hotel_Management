const HousekeepingTask = require('../models/HousekeepingTask.model');
const { publishEvent } = require('../../../shared/events/rabbitmq');
const {
  NotFoundError,
  AppError,
} = require('../../../shared/errors');

// Default checklist for checkout clean
const DEFAULT_CHECKLIST = [
  { item: 'Vacuum and mop floors',     done: false },
  { item: 'Clean and sanitize bathroom', done: false },
  { item: 'Change bed linens',          done: false },
  { item: 'Replace towels',             done: false },
  { item: 'Restock minibar',            done: false },
  { item: 'Wipe down all surfaces',     done: false },
  { item: 'Check TV, AC and lights',    done: false },
  { item: 'Replace toiletries',         done: false },
  { item: 'Empty bins',                 done: false },
  { item: 'Final inspection',           done: false },
];

// ─────────────────────────────────────────────────────────────────────────────
// CREATE TASK
// Called automatically when booking.checkedOut event is received
// Also called manually by managers
// ─────────────────────────────────────────────────────────────────────────────
const createTask = async ({
  propertyId,
  roomId,
  roomNumber,
  type        = 'checkout_clean',
  priority    = 'high',
  assignedTo,
  scheduledFor,
  bookingId,
  notes,
}) => {
  const task = await HousekeepingTask.create({
    propertyId,
    roomId,
    roomNumber,
    type,
    priority,
    assignedTo,
    scheduledFor: scheduledFor || new Date(),
    bookingId,
    notes,
    checklist: DEFAULT_CHECKLIST.map(item => ({ ...item })),
    status: 'pending',
  });

  return task;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET TASKS FOR PROPERTY
// ─────────────────────────────────────────────────────────────────────────────
const getPropertyTasks = async (propertyId, query = {}) => {
  const {
    status,
    assignedTo,
    type,
    date,
    page  = 1,
    limit = 20,
  } = query;

  const filter = { propertyId };
  if (status)     filter.status     = status;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (type)       filter.type       = type;
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    filter.scheduledFor = { $gte: start, $lte: end };
  }

  const total = await HousekeepingTask.countDocuments(filter);
  const tasks = await HousekeepingTask
    .find(filter)
    .sort({ priority: -1, scheduledFor: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  return {
    tasks,
    pagination: {
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// GET MY TASKS (for housekeeping staff)
// ─────────────────────────────────────────────────────────────────────────────
const getMyTasks = async (staffId, query = {}) => {
  const { status, page = 1, limit = 20 } = query;

  const filter = { assignedTo: staffId };
  if (status) filter.status = status;

  const total = await HousekeepingTask.countDocuments(filter);
  const tasks = await HousekeepingTask
    .find(filter)
    .sort({ priority: -1, scheduledFor: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  return {
    tasks,
    pagination: { total, page: Number(page), totalPages: Math.ceil(total / limit) },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// START TASK
// Housekeeping staff starts cleaning
// ─────────────────────────────────────────────────────────────────────────────
const startTask = async (taskId, staffId) => {
  const task = await HousekeepingTask.findById(taskId);
  if (!task) throw new NotFoundError('Task not found');

  if (task.status !== 'pending') {
    throw new AppError(
      `Task cannot be started. Current status: "${task.status}"`,
      400, 'INVALID_STATUS'
    );
  }

  task.status    = 'in_progress';
  task.startedAt = new Date();
  if (!task.assignedTo) task.assignedTo = staffId;
  await task.save();

  return task;
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPLETE TASK
// Staff marks task as done with checklist and optional photos
// ─────────────────────────────────────────────────────────────────────────────
const completeTask = async (taskId, staffId, { checklist, notes, photos }) => {
  const task = await HousekeepingTask.findById(taskId);
  if (!task) throw new NotFoundError('Task not found');

  if (task.status !== 'in_progress') {
    throw new AppError(
      `Task cannot be completed. Current status: "${task.status}"`,
      400, 'INVALID_STATUS'
    );
  }

  // Update checklist if provided
  if (checklist && checklist.length > 0) {
    checklist.forEach(({ item, done }) => {
      const found = task.checklist.find(c => c.item === item);
      if (found) found.done = done;
    });
  }

  task.status      = 'completed';
  task.completedAt = new Date();
  task.duration    = Math.round((task.completedAt - task.startedAt) / 60000); // minutes
  if (notes)  task.notes  = notes;
  if (photos) task.photos = photos;
  await task.save();

  // Publish event — property-service marks room as available
  try {
    await publishEvent('housekeeping.taskCompleted', {
      taskId:     task._id,
      roomId:     task.roomId,
      propertyId: task.propertyId,
      staffId,
    });
  } catch (err) {
    // Non-critical
  }

  return task;
};

// ─────────────────────────────────────────────────────────────────────────────
// VERIFY TASK
// Supervisor verifies the cleaning is up to standard
// ─────────────────────────────────────────────────────────────────────────────
const verifyTask = async (taskId, supervisorId) => {
  const task = await HousekeepingTask.findById(taskId);
  if (!task) throw new NotFoundError('Task not found');

  if (task.status !== 'completed') {
    throw new AppError('Only completed tasks can be verified', 400, 'INVALID_STATUS');
  }

  task.status = 'verified';
  await task.save();

  return task;
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE CHECKLIST ITEM
// Staff checks off individual checklist items
// ─────────────────────────────────────────────────────────────────────────────
const updateChecklistItem = async (taskId, itemName, done) => {
  const task = await HousekeepingTask.findById(taskId);
  if (!task) throw new NotFoundError('Task not found');

  const item = task.checklist.find(c => c.item === itemName);
  if (!item) throw new NotFoundError(`Checklist item "${itemName}" not found`);

  item.done = done;
  await task.save();

  return task;
};

// ─────────────────────────────────────────────────────────────────────────────
// ASSIGN TASK
// Manager reassigns task to different staff member
// ─────────────────────────────────────────────────────────────────────────────
const assignTask = async (taskId, staffId) => {
  const task = await HousekeepingTask.findById(taskId);
  if (!task) throw new NotFoundError('Task not found');

  task.assignedTo = staffId;
  await task.save();

  return task;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET TASK STATS (for manager dashboard)
// ─────────────────────────────────────────────────────────────────────────────
const getTaskStats = async (propertyId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [pending, inProgress, completed, verified] = await Promise.all([
    HousekeepingTask.countDocuments({ propertyId, status: 'pending',     scheduledFor: { $gte: today, $lt: tomorrow } }),
    HousekeepingTask.countDocuments({ propertyId, status: 'in_progress', scheduledFor: { $gte: today, $lt: tomorrow } }),
    HousekeepingTask.countDocuments({ propertyId, status: 'completed',   scheduledFor: { $gte: today, $lt: tomorrow } }),
    HousekeepingTask.countDocuments({ propertyId, status: 'verified',    scheduledFor: { $gte: today, $lt: tomorrow } }),
  ]);

  return {
    today: { pending, inProgress, completed, verified, total: pending + inProgress + completed + verified },
  };
};

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