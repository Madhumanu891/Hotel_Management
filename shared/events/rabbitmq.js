const amqp = require("amqplib");
const logger = require("../logger");

// configuration

const EXCHANGE_NAME = "hotel_events";
const DEAD_LETTER_EXCHANGE = "hotel_dlx";
const MAX_DELAYS = 3;
const RETRY_DELAYS = [1000, 2000, 4000];

// connection state
let connection = null;
let channel = null;
let isConnecting = false;

const connect = async () => {
  if (isConnecting) return;
  if (connection && channel) return;

  isConnecting = true;

  const RABBITMQ_URL =
    process.env.RABBITMQ_URL || "amqp://admin:admin123@localhost:5672";

  try {
    logger.info("Connecting to RabbitMQ...", { url: RABBITMQ_URL });

    connection = await amqp.connect(RABBITMQ_URL);

    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "topic", {
      durable: true,
    });

    await channel.assertExchange(DEAD_LETTER_EXCHANGE, "topic", {
      durable: true,
    });

    logger.info("RabbitMQ connected successfully", {
      exchange: EXCHANGE_NAME,
      dlx: DEAD_LETTER_EXCHANGE,
    });

    //handle connection errors
    connection.on("error", (err) => {
      logger.error(("RabbitMQ connection error", { error: err.message }));
      connection = null;
      channel = null;
      setTimeout(reconnect, 5000); // try reconnecting after 5 seconds
    });

    connection.on("close", () => {
      logger.warn("RabbitMQ connection closed");
      connection = null;
      channel = null;
      setTimeout(reconnect, 5000); // try reconnecting after 5 seconds
    });
  } catch (error) {
    isConnecting = false;
    connection = null;
    channel = null;
    logger.error("Failed to connect to RabbitMQ", { error: error.message });
    setTimeout(reconnect, 5000); // try reconnecting after 5 seconds
  }
};

// reconnect function

const reconnect = async () => {
  logger.info("Attempting to reconnect to RabbitMQ...");
  await connect();
};

// publish function
// routingKey: "hotel.created", "hotel.updated", "hotel.deleted"
// message: {id:123, name:"Hotel California", ...}
// options: {delay: 2000} // optional, for retrying failed messages

const publishEvent = async (routingKey, data) => {
  try {
    // ensure connection is ready
    if (!channel) {
      await connect();
    }

    // Convert data to buffer
    const message = Buffer.from(
      JSON.stringify({
        ...data,
        _meta: {
          routingKey,
          timestamp: new Date().toISOString(),
          service: process.env.SERVICE_NAME || "unknown_service",
        },
      }),
    );

    // Publish to exchange
    channel.publish(
      EXCHANGE_NAME, // exchange name
      routingKey, // routing key determines which queues receive the message(e.g., "hotel.created")
      message,
    );

    logger.info("Event published to RabbitMQ", {
      routingKey,
      dataKeys: Object.keys(data),
    });

    return true;
  } catch (error) {
    logger.error("Failed to publish event to RabbitMQ", {
      routingKey,
      error: error.message,
    });
    throw error;
  }
};

// ─────────────────────────────────────────────────────────
// CONSUME EVENTS
// Subscribes to events from RabbitMQ
// Automatically retries failed messages with backoff
// After MAX_RETRIES failures → sends to Dead Letter Queue
//
// Usage:
// await consumeEvents(
//   'notification_queue',
//   ['booking.confirmed', 'booking.cancelled'],
//   {
//     'booking.confirmed': handleBookingConfirmed,
//     'booking.cancelled': handleBookingCancelled
//   }
// );
// ─────────────────────────────────────────────────────────
const consumeEvents = async (queueName, routingKeys, handlers) => {
  try {
    // Make sure we are connected
    if (!channel) {
      await connect();
    }

    // ── Create Dead Letter Queue ─────────────────────────
    const dlqName = `${queueName}_dlq`;

    await channel.assertQueue(dlqName, {
      durable: true, // Survives RabbitMQ restart
    });

    // Bind DLQ to dead letter exchange
    // All routing keys go to DLQ
    await channel.bindQueue(dlqName, DEAD_LETTER_EXCHANGE, "#");

    // ── Create Main Queue ────────────────────────────────
    const { queue } = await channel.assertQueue(queueName, {
      durable: true, // Survives RabbitMQ restart
      arguments: {
        // Failed messages go to dead letter exchange
        "x-dead-letter-exchange": DEAD_LETTER_EXCHANGE,
        "x-dead-letter-routing-key": `dlq.${queueName}`,
      },
    });

    // ── Bind Queue to Routing Keys ───────────────────────
    for (const routingKey of routingKeys) {
      await channel.bindQueue(queue, EXCHANGE_NAME, routingKey);
      logger.info("Queue bound to routing key", { queue, routingKey });
    }

    // ── Process One Message at a Time ────────────────────
    // prefetch(1) means: only give me 1 message at a time
    // Do not give another until I acknowledge this one
    channel.prefetch(1);

    // ── Start Consuming ──────────────────────────────────
    channel.consume(queue, async (msg) => {
      if (!msg) return;

      let data;
      let routingKey;

      try {
        // Parse the message
        data = JSON.parse(msg.content.toString());
        routingKey = msg.fields.routingKey;

        // Get retry count from message headers
        const retryCount =
          (msg.properties.headers && msg.properties.headers["x-retry-count"]) ||
          0;

        logger.info("Event received", { routingKey, retryCount });

        // Find the right handler for this event
        const handler = handlers[routingKey];

        if (!handler) {
          logger.warn("No handler for routing key", { routingKey });
          channel.ack(msg); // Acknowledge so it is not requeued
          return;
        }

        // ── Run the Handler ────────────────────────────
        await handler(data);

        // Success → acknowledge message (remove from queue)
        channel.ack(msg);
        logger.info("Event processed successfully", { routingKey });
      } catch (err) {
        // ── Handle Failure ─────────────────────────────
        logger.error("Event processing failed", {
          routingKey,
          error: err.message,
        });

        const retryCount =
          (msg.properties.headers && msg.properties.headers["x-retry-count"]) ||
          0;

        if (retryCount < MAX_RETRIES) {
          // Retry with delay
          const delay = RETRY_DELAYS[retryCount] || 4000;

          logger.warn("Retrying event", {
            routingKey,
            attempt: retryCount + 1,
            delayMs: delay,
          });

          // Wait before retrying
          setTimeout(() => {
            // Reject and requeue with updated retry count
            channel.nack(msg, false, false);

            // Republish with updated retry count
            publishEvent(routingKey, {
              ...data,
              _headers: { "x-retry-count": retryCount + 1 },
            });
          }, delay);
        } else {
          // Max retries reached → send to Dead Letter Queue
          logger.error("Max retries reached. Sending to DLQ", {
            routingKey,
            retryCount,
          });
          // Reject without requeue → goes to DLQ automatically
          channel.nack(msg, false, false);
        }
      }
    });

    logger.info("Consumer started", {
      queue: queueName,
      routingKeys,
    });
  } catch (err) {
    logger.error("Failed to start consumer", {
      queue: queueName,
      error: err.message,
    });
    throw err;
  }
};

// ─────────────────────────────────────────────────────────
// GET CHANNEL
// Returns current channel for advanced usage
// ─────────────────────────────────────────────────────────
const getChannel = () => channel;

// ─────────────────────────────────────────────────────────
// CLOSE CONNECTION
// Gracefully closes connection on service shutdown
// ─────────────────────────────────────────────────────────
const closeConnection = async () => {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    logger.info("RabbitMQ connection closed gracefully");
  } catch (err) {
    logger.error("Error closing RabbitMQ", { error: err.message });
  }
};

module.exports = {
  connect,
  publishEvent,
  consumeEvents,
  getChannel,
  closeConnection,
};
