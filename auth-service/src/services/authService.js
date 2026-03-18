const User = require("../models/User.model");
const { getRedisClient } = require("../config/redis");
const { publishEvent } = require("../../../shared/events/rabbitmq");
const { generateTokens, hashToken } = require("../utils/tokenUtils");
const {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  AppError,
} = require("../../../shared/errors");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const asyncHandler = require("../../../shared/utils/asyncHandler");

// Register a new user
// Create a new user in the database and publish an event to RabbitMQ
const register = async ({ email, password, name, phone }) => {
  // Check if the user already exists
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ConflictError("An account with this email already exists");
  }

  // Create the user
  const user = await User.create({
    email,
    passwordHash: password,
    role: "guest",
    guestProfile: {
      phone: phone || undefined,
    },
  });

  // Generatee JWT token
  const { accessToken, refreshToken } = generateTokens(user._id, user.role);

  // Hash the refresh token before storing in DB
  user.refreshToken = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  // Publish an event to RabbitMQ
  // We publish the event after saving the user to ensure we have a valid user ID to include in the event

  try {
    await publishEvent("user.registered", {
      userId: user._id,
      email: user.email,
      name: name || "Guest",
    });
  } catch (error) {
    // If event publishing fails, we log the error but do not fail the registration process
    console.log("Could not publish user.registered event:", err.message);
  }

  return { user, accessToken, refreshToken };
};

// Login an existing user
// Validate credentials, generate tokens, and store hashed refresh token in DB
// Also checks for account lockout due to too many failed login attempts
// If login is successful, failedLoginAttempts is reset to 0 and lockUntil is cleared

const login = async ({ email, password }) => {
  // Find the user by email and include passwordHash ( which is excluded by default in the schema select: false)
  const user = await User.findOne({ email }).select(
    "+passwordHash +refreshToken",
  );

  // If user not found, throw unauthorized error (don't reveal whether email or password was incorrect)
  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // Check if account is locked
  if (user.isLocked) {
    const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
    throw new UnauthorizedError(
      `Account temporarily locked. Try again in ${minutesLeft} minutes.`,
    );
  }

  // Check if account is active (e.g. not deleted or deactivated by admin)
  if (!user.isActive) {
    throw new UnauthorizedError(
      "This account has been deactivated. Please contact support.",
    );
  }

  // Verify the password using bcrypt's compare function
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    // Handle failed login attempt (increment counter and set lock if necessary)
    await user.handleFailedLogin();
    throw new UnauthorizedError("Invalid email or password");
  }

  // If login is successful, reset failed login attempts and lock status
  await user.resetLoginAttempts();

  // Generate new access and refresh tokens
  const { accessToken, refreshToken } = generateTokens(user._id, user.role);

  // Hash the new refresh token and store in DB (replace old one)
  user.refreshToken = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  return { user, accessToken, refreshToken };
};

// Logout a user
// Blacklist the access token in Redis and remove the refresh token from the database
// Blacklisting the access token prevents its further use until it expires, even if it's still valid
// Removing the refresh token from the database ensures it cannot be used to obtain new access tokens
const logout = async (userId, accessToken) => {
  // Decode the access token to get its expiration time (exp claim)
  // jwt.decode does not verify the token, it just extracts the payload, which is sufficient for getting the exp time
  const decoded = jwt.decode(accessToken);

  if (decoded && decoded.exp) {
    const secondsRemaining = decoded.exp - Math.floor(Date.now() / 1000);

    if (secondsRemaining > 0) {
      const redis = getRedisClient();

      // Add the token to Redis blacklist with a TTL equal to the remaining time until it would naturally expire
      // This way, even if the token is still valid, it will be rejected by our authentication middleware which checks the blacklist
      await redis.setex(`blacklist:${accessToken}`, secondsRemaining, "1");
    }
  }

  // Remove the refresh token from the database by setting it to null
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

// REFRESH ACCESS TOKEN
// Issues a new access token using a valid refresh token
// Also rotates the refresh token — issues a new one and invalidates the old
//
// Token rotation means: every time you refresh, you get a brand new refresh token.
// If an attacker steals your refresh token and uses it, the next time YOU try
// to use it — it will have changed. You'll be forced to log in again.
// This is how you detect stolen refresh tokens.

const refreshAccessToken = async (refreshToken) => {
  // Verification: check if the refresh token is valid and not expired
  let decoded;

  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new UnauthorizedError(
      "Invalid or expired refresh token. Please log in again.",
    );
  }

  // Find the user and check stored hash matches incoming token
  const user = await User.findById(decoded.userId).select("+refreshToken");

  if (!user) {
    throw new UnauthorizedError("User not found. Please log in again.");
  }

  if (user.refreshToken !== hashToken(refreshToken)) {
    // Hash doesn't match - token was already rotated or is stolen
    // Invalidate ALL tokens for this user as a security measure

    await User.findByIdAndUpdate(decoded.userId, { refreshToken: null });
    throw new UnauthorizedError(
      "Refresh token is invalid. Please log in again.",
    );
  }

  // Generate fresh tokens (rotation - old refresh token will be invalidated when we save the new hash to DB)
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(
    user._id,
    user.role,
  );

  // Hash the new refresh token and save to DB
  user.refreshToken = hashToken(newRefreshToken);
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken: newRefreshToken };
};

// FORGOT PASSWORD
// Generates a secure reset token and stores its HASH in the DB
// Publishes an event — notification-service sends the reset email
//
// Security rule: always return the same response whether email exists or not
// Otherwise attacker can discover which emails are registered
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });

  if (!user) return;

  // Generate a secure random token (not JWT, just a random string)
  // 32 bytes = 64 hex charecters - practically impossible to guess
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Store hash with 10-minute expiry
  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes from now
  await user.save({ validateBeforeSave: false });

  // Publish event to RabbitMQ - notification service will handle sending the email
  const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  try {
    await publishEvent("user.passwordReset", {
      email: user.email,
      resetURL,
    });
  } catch (error) {
    // If event publishing fails, we log the error but do not fail the process
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false }); // clean up the reset token since we couldn't send the email
    throw new AppError(
      "Could not send reset email. Please try again.",
      500,
      "EMAIL_ERROR",
    );
  }
};

// RESET PASSWORD
// Verifies the reset token and updates the password
const resetPassword = async (resetToken, newPassword) => {
  // Hash the incoming token and find a user with that hash and a future expiry date
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, // check that expiry is in the future
  });

  if (!user) {
    throw new AppError(
      "Reset token is invalid or has expired",
      400,
      "INVALID_TOKEN",
    );
  }

  //update password - pre-save hook will hash it
  user.passwordHash = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  return user;
};

// GET Me
// Returns the current user's profile based on the user ID in the access token
const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found");
  return user;
};



module.exports = {
  register,
  login,
  logout,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  getMe,
};
