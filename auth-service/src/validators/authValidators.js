const { body, param } = require("express-validator");

// Register validator
const validateRegister = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("phone")
    .optional()
    .trim()
    .matches(/^[+]?[\d\s\-]{8,15}$/)
    .withMessage("Please provide a valid phone number"),
];

// Login validator
const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

// Forgot password validator
const validateForgotPassword = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
];

// Reset password validator
const validateResetPassword = [
  param("token").notEmpty().withMessage("Reset token is required"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at leaset one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at leaset one lowercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at leaset one number"),
];

// Change password validator
const validateChangePassword = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at leaset one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at leaset one lowercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at leaset one number")

    .custom((value, {req}) => {
      if(value === req.body.currentPassword){
        throw new Error('New password must be different from current password')
      }

      return true
    })
];


// Create staff validator
const validateCreateStaff = [
  body('email')
  .trim()
  .notEmpty().withMessage('Email is required')
  .isEmail().withMessage('Please provide a valid email address')
  .normalizeEmail(),

  body('password')
  .notEmpty().withMessage('Password is required')
  .isLength({min: 8}).withMessage('Password must be at least8 characters'),

  body('role')
  .notEmpty().withMessage('Role is required')
  .isIn(['hotel_manager', 'receptionist', 'housekeeping', 'restaurant_staff', 'hr_manager', 'accountant'])
  .withMessage('Invalid role'),

  body('employeeId')
  .optional()
  .trim()
  .notEmpty().withMessage('Employee ID cannot be empty'),



  body('department')
  .optional()
  .trim(),


  body('designation')
  .optional()
  .trim()

]


module.exports= {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateCreateStaff
}
