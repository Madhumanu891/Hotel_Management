require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { createProxyMiddleware } = require("http-proxy-middleware");

const logger = require("./utils/logger");
const { verifyToken } = require("./middlewares/auth");
const { generalLimiter, authLimiter } = require("./middlewares/rateLimiter");
const requestLogger = require("./middlewares/requestLogger");

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.set("trust proxy", 1);

// ── Parsing ───────────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// ── Request ID ────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  req.requestId =
    req.headers["x-request-id"] ||
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader("X-Request-ID", req.requestId);
  next();
});

// ── Logging ───────────────────────────────────────────────────────────────────
app.use(requestLogger);
app.use(
  morgan("combined", {
    stream: logger.stream,
    skip: (req) => req.url === "/health",
  }),
);

// ── Rate Limiting ─────────────────────────────────────────────────────────────
app.use(generalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    service: "api-gateway",
    timestamp: new Date().toISOString(),
    services: {
      auth: process.env.AUTH_SERVICE_URL,
      property: process.env.PROPERTY_SERVICE_URL,
      booking: process.env.BOOKING_SERVICE_URL,
      payment: process.env.PAYMENT_SERVICE_URL,
      housekeeping: process.env.HOUSEKEEPING_SERVICE_URL,
      notification: process.env.NOTIFICATION_SERVICE_URL,
      restaurant: process.env.RESTAURANT_SERVICE_URL,
      staff: process.env.STAFF_SERVICE_URL,
      analytics: process.env.ANALYTICS_SERVICE_URL,
    },
  });
});

// ── Proxy error handler ───────────────────────────────────────────────────────
const onProxyError = (err, req, res) => {
  logger.error("Proxy error", {
    error: err.message,
    url: req.originalUrl,
    target: req.headers["x-forwarded-host"],
  });

  res.status(503).json({
    success: false,
    code: "SERVICE_UNAVAILABLE",
    message: "Service is temporarily unavailable. Please try again.",
  });
};

// ── Route definitions ─────────────────────────────────────────────────────────
// PUBLIC routes — no token verification
const publicRoutes = [
  {
    path: "/api/auth",
    target: process.env.AUTH_SERVICE_URL,
  },
  {
    path: "/api/properties",
    target: process.env.PROPERTY_SERVICE_URL,
    // Only search and get routes are public
    // POST/PUT/DELETE will still be protected by downstream service
  },
  {
    path: "/api/restaurant",
    target: process.env.RESTAURANT_SERVICE_URL,
  },
];

// PROTECTED routes — require valid JWT
const protectedRoutes = [
  {
    path: "/api/bookings",
    target: process.env.BOOKING_SERVICE_URL,
  },
  {
    path: "/api/payments",
    target: process.env.PAYMENT_SERVICE_URL,
  },
  {
    path: "/api/housekeeping",
    target: process.env.HOUSEKEEPING_SERVICE_URL,
  },
  {
    path: "/api/staff",
    target: process.env.STAFF_SERVICE_URL,
  },
  {
    path: "/api/analytics",
    target: process.env.ANALYTICS_SERVICE_URL,
  },
];

// Register public routes
publicRoutes.forEach(({ path, target }) => {
  app.use(
    path,
    createProxyMiddleware({
      target,
      changeOrigin: true,

      onProxyReq: (proxyReq, req) => {
        if (req.body && Object.keys(req.body).length > 0) {
          const bodyData = JSON.stringify(req.body);

          // Update headers
          proxyReq.setHeader("Content-Type", "application/json");

          proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));

          // Write body
          proxyReq.write(bodyData);
        }
      },

      on: { error: onProxyError },
      logger: console,
    }),
  );
});

// Register protected routes (JWT verification before proxying)
protectedRoutes.forEach(({ path, target }) => {
  app.use(
    path,
    verifyToken,
    createProxyMiddleware({
      target,
      changeOrigin: true,

      onProxyReq: (proxyReq, req) => {
        if (req.body && Object.keys(req.body).length > 0) {
          const bodyData = JSON.stringify(req.body);

          proxyReq.setHeader("Content-Type", "application/json");

          proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));

          proxyReq.write(bodyData);
        }
      },

      on: { error: onProxyError },
      logger: console,
    }),
  );
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    code: "NOT_FOUND",
    message: `Route ${req.originalUrl} not found`,
  });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || "INTERNAL_ERROR";

  logger.error("Gateway error", {
    message: err.message,
    code,
    url: req.originalUrl,
    requestId: req.requestId,
  });

  res.status(statusCode).json({
    success: false,
    code,
    message: err.message || "Internal server error",
  });
});

module.exports = app;