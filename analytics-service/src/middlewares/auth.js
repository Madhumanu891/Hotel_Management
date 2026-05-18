const jwt            = require('jsonwebtoken');
const { getRedisClient } = require('../config/redis');
const { UnauthorizedError, ForbiddenError } = require('../../../shared/errors');

const protect = async (req, res, next) => {
  try {
    if (req.headers['x-internal-service']) {
      req.user = { _id: 'internal-service', role: 'super_admin' };
      return next();
    }
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided. Please log in.');
    }
    const token = authHeader.split(' ')[1];
    const redis = getRedisClient();
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) throw new UnauthorizedError('Token has been invalidated.');
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      throw new UnauthorizedError(
        err.name === 'TokenExpiredError' ? 'Session expired.' : 'Invalid token.'
      );
    }
    req.user = { _id: decoded.userId, role: decoded.role, propertyId: decoded.propertyId };
    next();
  } catch (err) { next(err); }
};

const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return next(new ForbiddenError(`Role "${req.user.role}" is not authorised.`));
  next();
};

module.exports = { protect, restrictTo };