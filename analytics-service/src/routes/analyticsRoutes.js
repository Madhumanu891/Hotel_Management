const router = require('express').Router();
const ctrl   = require('../controllers/analyticsController');
const { protect, restrictTo } = require('../middlewares/auth');

const MANAGERS = ['super_admin', 'hotel_manager', 'accountant'];

router.get('/:propertyId/revenue',
  protect,
  restrictTo(...MANAGERS),
  ctrl.getRevenueReport
);

router.get('/:propertyId/occupancy',
  protect,
  restrictTo(...MANAGERS),
  ctrl.getOccupancyReport
);

router.get('/:propertyId/stats',
  protect,
  restrictTo(...MANAGERS),
  ctrl.getBookingStats
);

module.exports = router;