const router = require("express").Router();
const authController = require("../controllers/authController");
const { protect, restrictTo } = require("../middlewares/auth");
const validate = require("../../../shared/middlewares/validate");
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateCreateStaff,
} = require("../validators/authValidators");

// Public routes - no token is required
router.post("/register", validateRegister, validate, authController.register);
router.post("/login", validateLogin, validate, authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post(
  "/forgot-password",
  validateForgotPassword,
  validate,
  authController.forgotPassword,
);
router.patch(
  "/reset-password/:token",
  validateResetPassword,
  validate,
  authController.resetPassword,
);

// Protected routes (protect middleware added) valid token required
router.post("/logout", protect, authController.logout);
router.get("/me", protect, authController.getMe);

// Staff management - admin only
router.post(
  "/staff/create",
  protect,
  restrictTo("super_admin", "hotel_manager"),
  validateCreateStaff,
  validate,
  authController.createStaff,
);

module.exports = router;
