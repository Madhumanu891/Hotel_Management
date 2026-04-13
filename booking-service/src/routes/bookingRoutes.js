const router = require('express').Router();
const ctrl   = require('../controllers/bookingController');
const { protect, restrictTo } = require('../middlewares/auth');

// ── Public ────────────────────────────────────────────────────────────────────
router.post('/check-availability', ctrl.checkAvailability);

// ── Guest routes ──────────────────────────────────────────────────────────────
router.post('/',       protect, restrictTo('guest'), ctrl.createBooking);
router.get('/my',      protect, ctrl.getMyBookings);
router.get('/:id',     protect, ctrl.getBookingById);
router.patch('/:id/cancel', protect, ctrl.cancelBooking);

// ── Receptionist routes ───────────────────────────────────────────────────────
router.patch('/:id/check-in',
  protect,
  restrictTo('receptionist', 'hotel_manager', 'super_admin'),
  ctrl.checkIn
);

router.patch('/:id/check-out',
  protect,
  restrictTo('receptionist', 'hotel_manager', 'super_admin'),
  ctrl.checkOut
);

// ── Manager routes ────────────────────────────────────────────────────────────
router.patch('/:id/confirm',
  protect,
  restrictTo('super_admin', 'hotel_manager'),
  ctrl.confirmBooking
);

router.get('/property/:propertyId',
  protect,
  restrictTo('super_admin', 'hotel_manager', 'receptionist'),
  ctrl.getPropertyBookings
);

module.exports = router;