const router = require('express').Router();
const ctrl   = require('../controllers/housekeepingController');
const { protect, restrictTo } = require('../middlewares/auth');

// Stats
router.get('/stats/:propertyId',
  protect,
  restrictTo('super_admin', 'hotel_manager'),
  ctrl.getTaskStats
);

// My tasks (housekeeping staff)
router.get('/my',
  protect,
  restrictTo('housekeeping', 'hotel_manager', 'super_admin'),
  ctrl.getMyTasks
);

// Property tasks (managers)
router.get('/property/:propertyId',
  protect,
  restrictTo('super_admin', 'hotel_manager', 'housekeeping'),
  ctrl.getPropertyTasks
);

// Create task manually
router.post('/',
  protect,
  restrictTo('super_admin', 'hotel_manager'),
  ctrl.createTask
);

// Task actions
router.patch('/:id/start',    protect, restrictTo('housekeeping', 'hotel_manager', 'super_admin'), ctrl.startTask);
router.patch('/:id/complete', protect, restrictTo('housekeeping', 'hotel_manager', 'super_admin'), ctrl.completeTask);
router.patch('/:id/verify',   protect, restrictTo('hotel_manager', 'super_admin'), ctrl.verifyTask);
router.patch('/:id/assign',   protect, restrictTo('hotel_manager', 'super_admin'), ctrl.assignTask);
router.patch('/:id/checklist',protect, restrictTo('housekeeping', 'hotel_manager', 'super_admin'), ctrl.updateChecklistItem);

module.exports = router;