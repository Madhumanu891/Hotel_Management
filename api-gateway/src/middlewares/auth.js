const jwt            = require('jsonwebtoken');
const { getRedisClient } = require('../config/redis');
const { UnauthorizedError } = require('../../../shared/errors/index');

// Gateway verifies JWT ONCE and injects user info into headers
// Downstream services trust these headers — no repeated DB lookups
const verifyToken = async (req, res, next) => {
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
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      throw new UnauthorizedError(
        err.name === 'TokenExpiredError'
          ? 'Session expired. Please log in again.'
          : 'Invalid token. Please log in again.'
      );
    }

    // Inject user info into headers for downstream services
    req.headers['x-user-id']       = decoded.userId;
    req.headers['x-user-role']     = decoded.role;
    req.headers['x-property-id']   = decoded.propertyId || '';
    req.headers['x-request-id']    = req.requestId;

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { verifyToken };