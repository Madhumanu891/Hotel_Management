const { createLogger, format, transports } = require('winston');

const { combine, timestamp, printf, colorize, errors, json } = format;

// ─── Dev Format ───────────────────────────────────────────
// Shows colored, readable logs in development
// Example: [2025-01-01 10:00:00] INFO  auth-service: Server started
const devFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  // Get service name from environment
  const service = process.env.SERVICE_NAME || 'service';

  // If there is an error stack, show it
  const log = stack ? `${message}\n${stack}` : message;

  // If there is extra data, show it
  const metaStr = Object.keys(meta).length
    ? '\n' + JSON.stringify(meta, null, 2)
    : '';

  return `[${timestamp}] ${level.padEnd(7)} ${service}: ${log}${metaStr}`;
});

// ─── Production Format ────────────────────────────────────
// Shows structured JSON logs in production
// Easy to read by log management tools like Datadog, Splunk
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

// ─── Development Format ───────────────────────────────────
const developmentFormat = combine(
  colorize({ all: true }),     // Add colors
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  devFormat
);

// ─── Create Logger ────────────────────────────────────────
const logger = createLogger({
  // Log level from env, default to 'info'
  level: process.env.LOG_LEVEL || 'info',

  // Use different format based on environment
  format: process.env.NODE_ENV === 'production'
    ? prodFormat
    : developmentFormat,

  // Where to send logs
  transports: [
    // Always log to console
    new transports.Console()
  ]
});

if (process.env.NODE_ENV === 'production') {
  logger.add(new transports.File({
    filename: 'logs/error.log',
    level: 'error',       
    maxsize: 10485760,    
    maxFiles: 5            
  }));

  logger.add(new transports.File({
    filename: 'logs/combined.log',
    maxsize: 10485760,   
    maxFiles: 10
  }));
}


logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

module.exports = logger;