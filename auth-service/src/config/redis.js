const Redis = require("ioredis");
const logger = require("../utils/logger");

let redisClient = null;

const connectRadis = () => {
  const REDIS_URL = process.env.REDIS_URL;

  if (!REDIS_URL) {
    logger.error("REDIS_URL is not defined in environment variables");
    process.exit(1);
  }

  // create a new Redis client
  redisClient = new Redis(REDIS_URL, {
    // Retry strategy for connection attempts

    retryStrategy: (times) => {
      if (times > 10) {
        logger.error("Redis max retries reached. Stopping service.");
        return null;
      }
      const delay = Math.min(times * 500, 5000); // Exponential backoff with a maximum delay of 5 seconds
      logger.warn(`Redis retry attempt ${times}. Waiting ${delay}ms`);
      return delay;
    },

    // connection name
    connectionName: process.env.SERVICE_NAME || "auth-service",
  });

  // Redis Event
  redisClient.on("connect", () => {
    logger.info("Redis connection successfully", {
      url: process.env.REDIS_URL,
    });
  });

  redisClient.on("error", (err) => {
    logger.error("Redis error", { error: err.message });
  });

  redisClient.on("close", () => {
    logger.warn("Redis connection closed");
  });

  redisClient.on("reconnectiong", () => {
    logger.info("Redis reconnecting...");
  });

  return redisClient;
};


// Get Redis client instance
// This function ensures that only one Redis client is created and reused across the application

const getRedisClient =()=>{
    if(!redisClient){
        throw new Error("Redis not initialized. Call connectRedis() first.");
    }
    return redisClient;
}

module.exports = {
    getRedisClient,
    connectRedis: connectRadis
}
