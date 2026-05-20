// Additional security middleware beyond helmet
// Applied to all services

const securityHeaders = (req, res, next) => {
  // Remove server fingerprinting
  res.removeHeader('X-Powered-By');

  // Prevent caching of sensitive responses
  if (req.path.includes('/api/auth') || req.path.includes('/api/payments')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma',        'no-cache');
  }

  // Content Security Policy
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options',        'DENY');
  res.setHeader('X-XSS-Protection',       '1; mode=block');

  next();
};

// Request size validator — extra protection against large payloads
const validateContentType = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'] || '';

    // Allow multipart for file uploads
    if (!contentType.includes('application/json') &&
        !contentType.includes('multipart/form-data') &&
        !contentType.includes('application/x-www-form-urlencoded')) {
      return res.status(415).json({
        success: false,
        code:    'UNSUPPORTED_MEDIA_TYPE',
        message: 'Content-Type must be application/json',
      });
    }
  }
  next();
};

module.exports = { securityHeaders, validateContentType };