const rateLimit = require('express-rate-limit');

// General API rate limit
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      200,
  message: {
    success: false,
    code:    'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders:   false,
});

// Strict limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20,
  message: {
    success: false,
    code:    'AUTH_RATE_LIMIT_EXCEEDED',
    message: 'Too many auth attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders:   false,
});

module.exports = { generalLimiter, authLimiter };