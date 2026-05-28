const logger = require("../logger");
const { AppError } = require("../errors");

const errorHandler = (err, req, res, next) => {
  // ── Set defaults ────────────────────────────────────────
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";
  let code = err.code || "INTERNAL_ERROR";

  // ── Log the error ────────────────────────────────────────
  if (statusCode >= 500) {
    // Server errors — log full details including stack
    logger.error("Server Error", {
      message,
      statusCode,
      code,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      requestId: req.headers["x-request-id"] || "unknown",
    });
  } else {
    // Client errors — log just the message
    logger.warn("Client Error", {
      message,
      statusCode,
      code,
      url: req.originalUrl,
      method: req.method,
    });
  }

  // ── Handle Mongoose Errors ───────────────────────────────

  // Duplicate key error (e.g. email already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    statusCode = 409;
    message = `${field} already exists`;
    code = "DUPLICATE_KEY";
  }

  // Invalid MongoDB ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    code = "INVALID_ID";
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 422;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    code = "VALIDATION_ERROR";
  }

  // ── Handle JWT Errors ────────────────────────────────────

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please log in again.";
    code = "INVALID_TOKEN";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Your session has expired. Please log in again.";
    code = "TOKEN_EXPIRED";
  }

  // ── Send Response ────────────────────────────────────────
  res.status(statusCode).json({
    success: false,
    code,
    message,

    // Only show stack trace in development
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};

module.exports = errorHandler;