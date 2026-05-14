const router = require('express').Router();
const ctrl   = require('../controllers/paymentController');
const { protect, restrictTo } = require('../middlewares/auth');

// Create PayPal order
router.post('/create-order',
  protect,
  ctrl.createOrder
);

// Capture payment after PayPal approval
router.post('/capture',
  protect,
  ctrl.capturePayment
);

// Get my payments
router.get('/my',
  protect,
  ctrl.getMyPayments
);

// Get payment for a specific booking
router.get('/booking/:bookingId',
  protect,
  ctrl.getPaymentByBooking
);

// Process refund (admin/manager only)
router.post('/:id/refund',
  protect,
  restrictTo('super_admin', 'hotel_manager', 'accountant'),
  ctrl.processRefund
);

module.exports = router;