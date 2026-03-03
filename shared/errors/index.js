// ─────────────────────────────────────────────────────────
// SHARED ERROR CLASSES
// Used by ALL services to throw consistent errors
// ─────────────────────────────────────────────────────────


// ─── Base Error Class ─────────────────────────────────────
// All other error classes extend this one
class AppError extends Error {
  constructor(message, statusCode, code) {
    // Call parent Error class
    super(message);

    this.statusCode = statusCode;
    this.code = code || 'APP_ERROR';
    this.isOperational = true; // Our own errors, not system crashes

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}


// ─── 400 Bad Request ──────────────────────────────────────
// Use when: request data is wrong or missing
// Example: throw new ValidationError('Check-in date is required')
class ValidationError extends AppError {
  constructor(message) {
    super(message || 'Validation failed', 400, 'VALIDATION_ERROR');
  }
}


// ─── 401 Unauthorized ─────────────────────────────────────
// Use when: user is not logged in
// Example: throw new UnauthorizedError()
class UnauthorizedError extends AppError {
  constructor(message) {
    super(message || 'You are not logged in', 401, 'UNAUTHORIZED');
  }
}


// ─── 403 Forbidden ────────────────────────────────────────
// Use when: user is logged in but not allowed to do this
// Example: throw new ForbiddenError('Only managers can do this')
class ForbiddenError extends AppError {
  constructor(message) {
    super(message || 'You do not have permission', 403, 'FORBIDDEN');
  }
}


// ─── 404 Not Found ────────────────────────────────────────
// Use when: something does not exist in database
// Example: throw new NotFoundError('Booking')
class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource || 'Resource'} not found`, 404, 'NOT_FOUND');
  }
}


// ─── 409 Conflict ─────────────────────────────────────────
// Use when: something already exists
// Example: throw new ConflictError('Email already registered')
class ConflictError extends AppError {
  constructor(message) {
    super(message || 'Resource already exists', 409, 'CONFLICT');
  }
}


// ─── 503 Service Unavailable ──────────────────────────────
// Use when: another service is down
// Example: throw new ServiceUnavailableError('Payment service')
class ServiceUnavailableError extends AppError {
  constructor(service) {
    super(
      `${service || 'Service'} is temporarily unavailable`,
      503,
      'SERVICE_UNAVAILABLE'
    );
  }
}


// ─── Export All ───────────────────────────────────────────
module.exports = {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ServiceUnavailableError
};