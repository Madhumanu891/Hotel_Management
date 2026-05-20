require("dotenv").config();
const express = require("express");
const logger = require("./utils/logger");
const { connect, consumeEvents } = require("../../shared/events/rabbitmq");
const { startConsumers } = require("./consumers/notificationConsumer");

const app = express();
const PORT = process.env.PORT || 3006;
const SERVICE = process.env.SERVICE_NAME || "notification-service";

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: SERVICE,
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

// Start server + connect to RabbitMQ + start consumers
const start = async () => {
  try {
    logger.info("Starting notification service...");

    await connect();
    logger.info("RabbitMQ connected");

    await startConsumers();

    app.listen(PORT, () => {
      logger.info("Notification service started successfully", {
        service: process.env.SERVICE_NAME || "notification-service",
        port: PORT,
        health: `http://localhost:${PORT}/health`,
      });
    });

  } catch (err) {
    logger.error("Failed to start notification service", {
      error: err.message,
    });
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down...");
  process.exit(0);
});
process.on("SIGINT", () => {
  logger.info("SIGINT received. Shutting down...");
  process.exit(0);
});

start();

module.exports = app;
