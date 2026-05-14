const paypal = require('@paypal/checkout-server-sdk');

// Returns configured PayPal client
// Sandbox for development, Live for production
const getPayPalClient = () => {
  const clientId     = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  const environment = process.env.PAYPAL_MODE === 'production'
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);

  return new paypal.core.PayPalHttpClient(environment);
};

module.exports = { getPayPalClient };