require('dotenv').config();
const app       = require('./app');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const logger    = require('./utils/logger');

const PORT    = process.env.PORT    || 3008;
const SERVICE = process.env.SERVICE_NAME || 'staff-service';

const startServer = async () => {
  try {
    logger.info(`Starting ${SERVICE}...`);
    await connectDB();
    connectRedis();

    const server = app.listen(PORT, () => {
      logger.info(`${SERVICE} started`, {
        port: PORT, environment: process.env.NODE_ENV,
        health: `http://localhost:${PORT}/health`,
      });
    });

    const shutdown = async (signal) => {
      logger.info(`${signal} received. Shutting down...`);
      server.close(async () => {
        const mongoose = require('mongoose');
        await mongoose.connection.close();
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

  } catch (err) {
    logger.error(`Failed to start ${SERVICE}`, { error: err.message });
    process.exit(1);
  }
};

startServer();