const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const { getRedisClient } = require("../config/redis");
const {
  UnauthorizedError,
  ForbiddenError,
} = require("../../../shared/errors/index");

// protect
// Verifies the JWT access token on every protected request
// Attaches the user document to req.user for use in controllers
//
// Usage in routes:
//   router.get('/me', protect, authController.getMe);
//   router.post('/logout', protect, authController.logout);

const protect = async (req, res, next) => {
  try {
    // step-1 : Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
      throw new UnauthorizedError(
        "No token provided. Please log in to access this resource.",
      );
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new UnauthorizedError("Invalid token format. Please log in again.");
    }

    // step-2 : check Redis blacklist
    // When a user logs out, their token is added to Redis with a TTL
    // matching the token's remaining lifetime. If found here, token was
    // explicitly invalidated and must be rejected even if still valid.
    const redis = getRedisClient();
    const isBlacklisted = await redis.get(`blacklist:${token}`);

    if (isBlacklisted) {
      throw new UnauthorizedError(
        "Token has been invalidated. Please log in again.",
      );
    }

    // step-3 : Verify JWT signature and expiry
    // jwt.verify() throws if:
    //   - Token was tampered with (invalid signature)
    //   - Token has expired (exp claim in the past)
    //   - Token is malformed
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new UnauthorizedError(
          "Your session has expired. Please log in again.",
        );
      }

      throw new UnauthorizedError("Invalid token. Please log in again.");
    }

    // Step-4 : Load fresh user from database
    // We load from DB (not just trust the token payload) because:
    //   - User might have been deactivated since token was issued
    //   - Role might have changed since token was issued
    //   - User might have been deleted
    // The token payload only contains userId and role at time of issue
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new UnauthorizedError(
        "User account no longer exists. Please log in again.",
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedError(
        "Your account has been deactivated. Please contact support.",
      );
    }

    // step-5 : Attach user to request
    // Every controller after this middleware can access req.user
    // Example: req.user._id, req.user.role, req.user.propertyId
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// restrictTo
// Role-based access control — only allows specified roles through
// This is a MIDDLEWARE FACTORY — it returns a middleware function
//
// Usage in routes:
//   router.get('/staff', protect, restrictTo('hotel_manager', 'super_admin'), ctrl)
//
// Why a factory?
//   Normal middleware: (req, res, next) — cannot accept custom parameters
//   Factory: called with roles → returns a middleware that has those roles in closure
const restrictTo =(...allowedRoles) =>{
  return (req,res,next) => {
    //req.user was attached by protect() which must run before restrictTo()
    if(!req.user){
      return next(
        new UnauthorizedError('Please log in first')
      )
    }

    if(!allowedRoles.includes(req.user.role)){
      return next(
        new ForbiddenError(`Access denied. Your role (${req.user.role}) is not authorised to perform this action.`)
      )
    }

    next()
  }
}



// checkSameProperty
// Ensures staff members can only access data for their own property
// super_admin is exempt — they manage all properties
//
// Usage in routes:
//   router.get('/:propertyId/rooms', protect, checkSameProperty, ctrl)

const checkSameProperty = (req,res,next) => {
  if(req.user.role === 'super_admin') return next()  // super_admin can access any property

  //Get the requested propertyId from params or body
  const requestedPropertyId = req.params.propertyId || req.body.propertyId

  if(!requestedPropertyId) return next()

    // Compare 
    if(req.user.propertyId?.toString() !== requestedPropertyId.toString()){
      return next(
        new ForbiddenError("You can only access dta for your own property.")
      )
    }

    next()
}

module.exports = {protect, restrictTo, checkSameProperty}