const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level    = res.statusCode >= 500 ? 'error'
                   : res.statusCode >= 400 ? 'warn'
                   : 'info';

    logger[level]('Gateway request', {
      method:     req.method,
      url:        req.originalUrl,
      status:     res.statusCode,
      duration:   `${duration}ms`,
      userId:     req.headers['x-user-id'] || 'anonymous',
      role:       req.headers['x-user-role'] || 'none',
      ip:         req.ip,
      requestId:  req.requestId,
    });
  });

  next();
};

module.exports = requestLogger;