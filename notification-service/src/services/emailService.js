const transporter = require("../utils/emailTransporter");
const { welcomeEmail, passwordResetEmail } = require("../utils/emailTemplates");
const logger = require("../utils/logger");

const FROM = `"${process.env.FROM_NAME || "NexoraHotels"}" <${process.env.FROM_EMAIL}>`;

// sendEmail — base function used by all specific email senders
const sendEmail = async ({ to, subject, html }) => {
  const info = await transporter.sendMail({ from: FROM, to, subject, html });
  logger.info("Email sent", { to, subject, messageId: info.messageId });
  return info;
};

// sendWelcomeEmail — triggered by user.registered event
const sendWelcomeEmail = async ({ email, name }) => {
  const { subject, html } = welcomeEmail(name || "Guest");
  await sendEmail({ to: email, subject, html });
};

// sendPasswordResetEmail — triggered by user.passwordReset event
const sendPasswordResetEmail = async ({ email, resetURL }) => {
  const { subject, html } = passwordResetEmail(resetURL);
  await sendEmail({ to: email, subject, html });
};

module.exports = { sendWelcomeEmail, sendPasswordResetEmail };
