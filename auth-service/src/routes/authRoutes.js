const router         = require('express').Router();
const authController = require('../controllers/authController');
const {protect ,restrictTo } = require('../middlewares/auth');

// Public routes - no token is required
router.post('/register',               authController.register);
router.post('/login',                  authController.login);
router.post('/refresh-token',          authController.refreshToken);
router.post('/forgot-password',        authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

// Protected routes (protect middleware added) valid token required
router.post('/logout', protect, authController.logout);
router.get('/me',     protect,  authController.getMe);

// Staff management - admin only
router.post("/staff/create", protect, restrictTo('super_admin', 'hotel_manager'), authController.createStaff)


module.exports = router;