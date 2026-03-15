const router         = require('express').Router();
const authController = require('../controllers/authController');

// Public routes
router.post('/register',               authController.register);
router.post('/login',                  authController.login);
router.post('/refresh-token',          authController.refreshToken);
router.post('/forgot-password',        authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

// Protected routes (protect middleware added on Day 9)
router.post('/logout', authController.logout);
router.get('/me',      authController.getMe);

module.exports = router;