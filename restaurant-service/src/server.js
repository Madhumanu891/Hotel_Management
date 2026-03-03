require("dotenv").config();
const express = require("express");
const logger = require("./utils/logger");

const app = express();
const PORT = process.env.PORT || 3007;
const SERVICE = process.env.SERVICE_NAME || "restaurant-service";

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: SERVICE,
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  logger.info(`Server started successfully`, {
    port: PORT,
    environment: process.env.NODE_ENV,
    health: `http://localhost:${PORT}/health`,
  });
});

module.exports = app;
