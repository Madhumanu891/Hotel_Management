const logger = require('../utils/logger');

// ─────────────────────────────────────────────────────────────────────────────
// Advanced Request Logger
// Logs every request with timing, user context, and response details
// Used for debugging, monitoring, and audit trails
// ─────────────────────────────────────────────────────────────────────────────
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request received
  if (req.url !== '/health') {
    logger.info('→ Request', {
      method:    req.method,
      url:       req.originalUrl,
      ip:        req.ip,
      requestId: req.requestId,
      userId:    req.user?._id || 'anonymous',
      role:      req.user?.role || 'none',
      userAgent: req.headers['user-agent']?.slice(0, 80),
    });
  }

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level    = res.statusCode >= 500 ? 'error'
                   : res.statusCode >= 400 ? 'warn'
                   : 'info';

    if (req.url !== '/health') {
      logger[level]('← Response', {
        method:    req.method,
        url:       req.originalUrl,
        status:    res.statusCode,
        duration:  `${duration}ms`,
        requestId: req.requestId,
        userId:    req.user?._id || 'anonymous',
      });
    }

    // Warn on slow requests
    if (duration > 3000) {
      logger.warn('⚠️ Slow request detected', {
        url:       req.originalUrl,
        duration:  `${duration}ms`,
        requestId: req.requestId,
      });
    }
  });

  next();
};

module.exports = requestLogger;