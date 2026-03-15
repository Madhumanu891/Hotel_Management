const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
// const mongoSanitize = require("express-mongo-sanitize");

const logger = require("./utils/logger");
const errorHandler = require("../../shared/middlewares/errorHandler");
const notFound = require("../../shared/middlewares/notFound");
const authRoutes =require("../src/routes/authRoutes")

const app = express();

// Middleware
app.use(helmet());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "htpp://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Trust proxy - needed when behind API Gateway or load balancer
app.set("trust proxy", 1);

// Rate Limiting
// Prevent brute-force attacks and abuse by limiting the number of requests from a single IP

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    code: "RATE_LIMIT_EXCEEDED",
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiting for authentication endpoints to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    code: "AUTH_RATE_LIMIT_EXCEEDED",
    message: "Too many attempts. Please try again in 15 minutes.",
  },
});

// Sanitize request body, query, and params against NoSQL injection
// Removes any keys that start with $ or contain a dot
const sanitizeInput = (obj) => {
  if (!obj || typeof obj !== "object") return;
  Object.keys(obj).forEach((key) => {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
    } else if (typeof obj[key] === "object") {
      sanitizeInput(obj[key]); // Recurse into nested objects
    }
  });
};

app.use((req, res, next) => {
  sanitizeInput(req.body);
  sanitizeInput(req.params);
  next();
});


app.use(generalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/register", authLimiter);

app.use(express.json({ limit: "10kb" }));

app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(cookieParser());

// Data sanitization against NoSQL query injection
// This middleware looks for any keys in the request that contain prohibited characters (like $ or .) and removes them, preventing malicious queries from being executed against the database.
// app.use(mongoSanitize({ replaceWith: "_" }));

// HTTP request logger
// Morgan is used to log incoming HTTP requests in a standardized format, which is helpful for debugging and monitoring the application. The logs are integrated with our custom logger to ensure consistency in log management.
app.use(
  morgan("combined", {
    stream: logger.stream, // Use the custom logger's stream to write logs
    skip: (req) => req.url === "/health", // Skip logging for health check endpoint to reduce noise in logs
  }),
);

// Requist ID Middleware
// This middleware generates a unique request ID for each incoming request and attaches it to the request object. This allows us to trace logs and debug issues more effectively by correlating logs with specific requests.
app.use((req, res, next) => {
  req.requestId =
    req.headers["x-request-id"] ||
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader("X-Request-ID", req.requestId); // Include request ID in response headers for better traceability
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





app.use('/api/auth', authRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
