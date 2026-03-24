const nodemailer = require("nodemailer");
const logger = require("./logger");

// Create reusable transporter using Gmail
// pool: true keeps connections open instead of creating one per email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

// Verify connection on startup
transporter.verify((err) => {
  if (err) {
    logger.error("Email transporter connection failed", { error: err.message });
  } else {
    logger.info("Email transporter ready");
  }
});

module.exports = transporter;
