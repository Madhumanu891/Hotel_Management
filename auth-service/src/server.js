// ─────────────────────────────────────────────────────────
// AUTH SERVICE — SERVER ENTRY POINT
// Starts the server and handles graceful shutdown
// ─────────────────────────────────────────────────────────

require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const connectRabbitMQ = require('./config/rabbitmq');
const { closeConnection } = require('../../shared/events/rabbitmq');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3001;
const SERVICE = process.env.SERVICE_NAME || 'auth-service';

// ─────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    logger.info('Starting auth service...');

    // Step 1 — Connect to MongoDB
    await connectDB();

    // Step 2 — Connect to Redis
    connectRedis();

    // Step 3 — Connect to RabbitMQ
    await connectRabbitMQ();

    // Step 4 — Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info('Auth service started successfully', {
        port: PORT,
        environment: process.env.NODE_ENV,
        health: `http://localhost:${PORT}/health`
      });
    });

    // ─────────────────────────────────────────────────────
    // GRACEFUL SHUTDOWN
    // When server stops (Ctrl+C or deployment restart)
    // finish current requests, then close connections
    // ─────────────────────────────────────────────────────
    const shutdown = async (signal) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      // Stop accepting new requests
      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          // Close MongoDB connection
          const mongoose = require('mongoose');
          await mongoose.connection.close();
          logger.info('MongoDB connection closed');

          // Close RabbitMQ connection
          await closeConnection();
          logger.info('RabbitMQ connection closed');

          logger.info('Graceful shutdown complete');
          process.exit(0);

        } catch (err) {
          logger.error('Error during shutdown', { error: err.message });
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      // In case some connection hangs
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Listen for shutdown signals
    process.on('SIGTERM', () => shutdown('SIGTERM')); // Docker stop
    process.on('SIGINT', () => shutdown('SIGINT'));   // Ctrl+C

    // ─────────────────────────────────────────────────────
    // UNHANDLED ERRORS
    // Catch any errors we missed
    // ─────────────────────────────────────────────────────
    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled Promise Rejection', {
        error: err.message,
        stack: err.stack
      });
      // Graceful shutdown on unhandled rejection
      shutdown('unhandledRejection');
    });

    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception', {
        error: err.message,
        stack: err.stack
      });
      // Must exit on uncaught exception
      process.exit(1);
    });

  } catch (err) {
    logger.error('Failed to start auth service', {
      error: err.message
    });
    process.exit(1);
  }
};

// Start the server
startServer();