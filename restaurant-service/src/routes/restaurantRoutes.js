const router = require('express').Router();
const ctrl   = require('../controllers/restaurantController');
const { protect, restrictTo } = require('../middlewares/auth');

// ── Menu (public) ─────────────────────────────────────────────────────────────
router.get('/:propertyId/menu', ctrl.getMenu);

// ── Menu management ───────────────────────────────────────────────────────────
router.post('/:propertyId/menu',
  protect,
  restrictTo('super_admin', 'hotel_manager', 'restaurant_staff'),
  ctrl.createMenuItem
);

router.put('/:propertyId/menu/:itemId',
  protect,
  restrictTo('super_admin', 'hotel_manager', 'restaurant_staff'),
  ctrl.updateMenuItem
);

router.patch('/:propertyId/menu/:itemId/toggle',
  protect,
  restrictTo('super_admin', 'hotel_manager', 'restaurant_staff'),
  ctrl.toggleAvailability
);

// ── Orders ────────────────────────────────────────────────────────────────────
router.post('/:propertyId/orders',
  protect,
  ctrl.placeOrder
);

router.get('/orders/my',
  protect,
  ctrl.getMyOrders
);

router.get('/:propertyId/orders',
  protect,
  restrictTo('super_admin', 'hotel_manager', 'restaurant_staff'),
  ctrl.getOrders
);

router.get('/:propertyId/orders/kitchen',
  protect,
  restrictTo('super_admin', 'hotel_manager', 'restaurant_staff'),
  ctrl.getLiveKitchenOrders
);

router.patch('/:propertyId/orders/:orderId/status',
  protect,
  restrictTo('super_admin', 'hotel_manager', 'restaurant_staff'),
  ctrl.updateOrderStatus
);

module.exports = router;