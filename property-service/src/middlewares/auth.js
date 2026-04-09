const jwt                = require('jsonwebtoken');
const { getRedisClient } = require('../config/redis');
const {
  UnauthorizedError,
  ForbiddenError,
} = require('../../../shared/errors');
const mongoose = require('mongoose');

// In property-service we don't have a User model
// We just decode the token and trust the claims
// Full user verification happens at the API Gateway (Day 53)
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided. Please log in.');
    }

    const token = authHeader.split(' ')[1];

    // Check blacklist
    const redis = getRedisClient();
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new UnauthorizedError('Token has been invalidated. Please log in again.');
    }

    // Verify token
    let decoded;
    try {
      decoded = require('jsonwebtoken').verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      throw new UnauthorizedError(
        err.name === 'TokenExpiredError'
          ? 'Session expired. Please log in again.'
          : 'Invalid token. Please log in again.'
      );
    }

    // Attach decoded user to request
    // We trust the JWT claims — no DB lookup needed in property-service
    req.user = {
      _id:        decoded.userId,
      role:       decoded.role,
      propertyId: decoded.propertyId,
    };

    next();
  } catch (err) {
    next(err);
  }
};

const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new ForbiddenError(
      `Role "${req.user.role}" is not authorised to perform this action.`
    ));
  }
  next();
};

module.exports = { protect, restrictTo };