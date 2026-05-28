const paypal = require('@paypal/checkout-server-sdk');

// ─────────────────────────────────────────────────────────────────────────────
// PayPal SDK Configuration
// Uses Sandbox in development, Live in production
// Get credentials from https://developer.paypal.com
// ─────────────────────────────────────────────────────────────────────────────
const getPayPalClient = () => {
  const clientId     = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials missing in environment variables');
  }

  const environment = process.env.NODE_ENV === 'production'
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);

  return new paypal.core.PayPalHttpClient(environment);
};

module.exports = { getPayPalClient };