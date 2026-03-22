const authService = require("../services/authService");
const asyncHandler = require("../../../shared/utils/asyncHandler");
const { getCookieOptions } = require("../utils/tokenUtils");

// Register controller
// Validates input and calls authService.register to create a new user
// Sets the access and refresh tokens in HTTP-only cookies
//  POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { email, password, name, phone } = req.body;

  const { user, accessToken, refreshToken } = await authService.register({
    email,
    password,
    name,
    phone,
  });

  // Set refresh tokens in HTTP-only cookies
  res.cookie("refreshToken", refreshToken, getCookieOptions());

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    },
  });
});

//   LOGIN POST /api/auth/login
// Validates input and calls authService.login to authenticate the user
// Sets the access and refresh tokens in HTTP-only cookies
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await authService.login({
    email,
    password,
  });

  // Set refresh tokens in HTTP-only cookies
  res.cookie("refreshToken", refreshToken, getCookieOptions());

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    },
  });
});

// LOGOUT POST /api/auth/logout
// Clears the refresh token cookie and calls authService.logout to invalidate the refresh token in the database
const logout = asyncHandler(async (req, res) => {
  // Get access token from header (protect middleware ensures it's valid)
  const accessToken = req.headers.authorization?.split(" ")[1];

  await authService.logout(req.user._id, accessToken);

  // Clear the refresh token cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

// REFRESH TOKEN POST /api/auth/refresh-token
// Calls authService.refreshAccessToken to validate the refresh token and issue a new access token
// Sets the new refresh token in HTTP-only cookies
const refreshToken = asyncHandler(async (req, res) => {
  // Get refresh token from cookies
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No refresh token found. Please log in again.",
    });
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await authService.refreshAccessToken(token);

  // Set the new refresh token in HTTP-only cookies
  res.cookie("refreshToken", newRefreshToken, getCookieOptions());

  res.status(200).json({
    success: true,
    data: { accessToken },
  });
});

// FORGOT PASSWORD POST /api/auth/forgot-password
// Validates email and calls authService.forgotPassword to generate a reset token and publish an event for sending the reset email
const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);

  // ALWAYS return 200 with the same message - even if email doesn't exist - to prevent user enumeration attacks
  // Never reveal whether an email is registered in your system
  res.status(200).json({
    success: true,
    message:
      "If an account with that email exists, a password reset link has been sent.",
  });
});

// RESET PASSWORD PATCH /api/auth/reset-password/:token
// Validates the reset token and new password, then calls authService.resetPassword to update the user's password
const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.params.token, req.body.newPassword);

  res.status(200).json({
    success: true,
    message:
      "Password updated successful. You can now log in with your new password.",
  });
});

// GET ME  GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);

  res.status(200).json({
    success: true,
    data: { user },
  });
});

// Creating staff
// hotel_manager can only create staff for their own property
// super_admin can create staff for any property
const createStaff = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    role,
    propertyId: bodyPropertyId,
    employeeId,
    department,
    designation,
    salary,
  } = req.body;

  // hotel_manager can only create staff for their own property
  // super_admin can specify any propertyId in the body
  const propertyId =
    req.user.role === "super_admin" ? req.body.propertyId : req.user.propertyId;

  if (!propertyId) {
    return res.status(400).json({
      success: false,
      message: "Property ID is required to create a staff account",
    });
  }

  const User = require("../models/User.model");

  const existing = await User.findOne({ email });

  if (existing) {
    return res.status(409).json({
      success: false,
      code: "CONFLICT",
      message: "An account with this email already exists",
    });
  }

  const staff = await User.create({
    email,
    passwordHash: password,
    role,
    propertyId,
    staffProfile: {
      employeeId,
      department,
      designation,
      salary: salary ? Number(salary) : undefined,
    },
  });

  (res.status(201).
    json({
      success: true,
      message: `${role} account created successfully.`,
      data: {
        id: staff._id,
        email: staff.email,
        role: staff.role,
        propertyId: staff.propertyId,
        employeeId: staff.staffProfile.employeeId,
        department: staff.staffProfile.department,
      },
    }));
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  getMe,
  createStaff,
};
