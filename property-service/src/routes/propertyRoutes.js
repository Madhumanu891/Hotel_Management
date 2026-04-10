const router     = require('express').Router();
const ctrl       = require('../controllers/propertyController');
const { protect, restrictTo } = require('../middlewares/auth');
const upload     = require('../middlewares/upload');
const validate   = require('../../../shared/middlewares/validate');
const {
  validateCreateProperty,
  validateCreateRoomType,
  validateCreateRoom,
  validateAvailabilitySearch,
  validateUpdateRoomStatus,
} = require('../validators/propertyValidators');

// ── Public routes ─────────────────────────────────────────────────────────────
router.get('/search/available',
  validateAvailabilitySearch,
  validate,
  ctrl.searchAvailable
);

router.get('/',      ctrl.getProperties);
router.get('/:slug', ctrl.getPropertyBySlug);

// ── Manager only ──────────────────────────────────────────────────────────────
router.post('/',
  protect,
  restrictTo('super_admin', 'hotel_manager'),
  validateCreateProperty,
  validate,
  ctrl.createProperty
);

router.put('/:id',
  protect,
  restrictTo('super_admin', 'hotel_manager'),
  ctrl.updateProperty
);

router.delete('/:id',
  protect,
  restrictTo('super_admin'),
  ctrl.deactivateProperty
);

// ── Images ────────────────────────────────────────────────────────────────────
router.post('/:id/images',
  protect,
  restrictTo('super_admin', 'hotel_manager'),
  upload.single('image'),
  ctrl.uploadImage
);

router.delete('/:id/images/:publicId',
  protect,
  restrictTo('super_admin', 'hotel_manager'),
  ctrl.deleteImage
);

// ── Room Types ────────────────────────────────────────────────────────────────
router.get('/:id/room-types', ctrl.getRoomTypes);

router.post('/:id/room-types',
  protect,
  restrictTo('super_admin', 'hotel_manager'),
  validateCreateRoomType,
  validate,
  ctrl.createRoomType
);

router.put('/:id/room-types/:roomTypeId',
  protect,
  restrictTo('super_admin', 'hotel_manager'),
  ctrl.updateRoomType
);

router.delete('/:id/room-types/:roomTypeId',
  protect,
  restrictTo('super_admin', 'hotel_manager'),
  ctrl.deleteRoomType
);

// ── Rooms ─────────────────────────────────────────────────────────────────────
router.get('/:id/rooms',
  protect,
  restrictTo('super_admin', 'hotel_manager', 'receptionist'),
  ctrl.getRooms
);

router.post('/:id/rooms',
  protect,
  restrictTo('super_admin', 'hotel_manager'),
  validateCreateRoom,
  validate,
  ctrl.createRoom
);

router.put('/:id/rooms/:roomId',
  protect,
  restrictTo('super_admin', 'hotel_manager', 'housekeeping', 'receptionist'),
  validateUpdateRoomStatus,
  validate,
  ctrl.updateRoomStatus
);

module.exports = router;