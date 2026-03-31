require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const logger = require("./utils/logger");
const errorHandler = require("../../shared/middlewares/errorHandler");
const notFound = require("../../shared/middlewares/notFound");
const authRoutes = require("./routes/authRoutes");

const app = express();

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

// Parse bodies FIRST
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Sanitize AFTER parsing
const sanitizeInput = (obj) => {
  if (!obj || typeof obj !== "object") return;
  Object.keys(obj).forEach((key) => {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
    } else if (typeof obj[key] === "object") {
      sanitizeInput(obj[key]);
    }
  });
};
app.use((req, res, next) => {
  sanitizeInput(req.body);
  sanitizeInput(req.params);
  next();
});

// Rate limiters
// AFTER
const passThrough = (req, res, next) => next();

const generalLimiter =
  process.env.NODE_ENV === "test"
    ? passThrough
    : rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: {
          success: false,
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests.",
        },
        standardHeaders: true,
        legacyHeaders: false,
      });
const authLimiter =
  process.env.NODE_ENV === "test"
    ? passThrough
    : rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 10,
        message: {
          success: false,
          code: "AUTH_RATE_LIMIT_EXCEEDED",
          message: "Too many attempts.",
        },
        standardHeaders: true,
        legacyHeaders: false,
      });
app.use(generalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

app.use(
  morgan("combined", {
    stream: logger.stream,
    skip: (req) => req.url === "/health",
  }),
);

app.use((req, res, next) => {
  req.requestId =
    req.headers["x-request-id"] ||
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader("X-Request-ID", req.requestId);
  next();
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    service: process.env.SERVICE_NAME || "auth-service",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`,
  });
});

app.use("/api/auth", authRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
