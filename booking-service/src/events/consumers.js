const { consumeEvent } = require('../../../shared/events/rabbitmq');
const Booking = require('../models/Booking.model');
const logger  = require('../../../shared/logger');

const startConsumers = async () => {
  // Listen for payment completion → confirm booking
  await consumeEvent('payment.completed', async (data) => {
    try {
      const { bookingId, paymentId } = data;

      const booking = await Booking.findById(bookingId);
      if (!booking) {
        logger.warn('Booking not found for payment event', { bookingId });
        return;
      }

      if (booking.status === 'pending') {
        booking.status        = 'confirmed';
        booking.paymentId     = paymentId;
        booking.paymentStatus = 'paid';
        booking.confirmedAt   = new Date();
        await booking.save();
        logger.info('Booking confirmed via payment event', { bookingId });
      }
    } catch (err) {
      logger.error('Error processing payment.completed event', { error: err.message });
    }
  });
};

module.exports = { startConsumers };