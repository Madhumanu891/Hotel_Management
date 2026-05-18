const router = require('express').Router();
const ctrl   = require('../controllers/staffController');
const { protect, restrictTo } = require('../middlewares/auth');

const MANAGERS = ['super_admin', 'hotel_manager', 'hr_manager'];
const ALL_STAFF = [...MANAGERS, 'receptionist', 'housekeeping', 'restaurant_staff', 'accountant'];

// Stats
router.get('/stats/:propertyId', protect, restrictTo(...MANAGERS), ctrl.getStaffStats);

// Shifts
router.get('/shifts/my',           protect, ctrl.getMyShifts);
router.get('/shifts/:propertyId',  protect, restrictTo(...MANAGERS), ctrl.getPropertyShifts);
router.post('/shifts',             protect, restrictTo(...MANAGERS), ctrl.createShift);
router.patch('/shifts/:shiftId',   protect, restrictTo(...MANAGERS), ctrl.updateShiftStatus);
router.post('/shifts/:propertyId/weekly', protect, restrictTo(...MANAGERS), ctrl.createWeeklySchedule);

// Leave requests
router.get('/leave/my',                    protect, ctrl.getMyLeaveRequests);
router.get('/leave/:propertyId',           protect, restrictTo(...MANAGERS), ctrl.getLeaveRequests);
router.post('/leave',                      protect, ctrl.applyForLeave);
router.patch('/leave/:leaveId/review',     protect, restrictTo(...MANAGERS), ctrl.reviewLeaveRequest);

module.exports = router;