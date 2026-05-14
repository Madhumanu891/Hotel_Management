const { consumeEvents } = require('../../../shared/events/rabbitmq');
const housekeepingService = require('../services/housekeepingService');
const logger = require('../utils/logger');

const handleCheckout = async (data) => {
  const { bookingId, roomId, propertyId } = data;

  logger.info('booking.checkedOut received — creating housekeeping task', { roomId, propertyId });

  await housekeepingService.createTask({
    propertyId,
    roomId,
    type:     'checkout_clean',
    priority: 'high',
    bookingId,
    notes:    'Auto-created on guest checkout',
  });

  logger.info('Housekeeping task created for checked-out room', { roomId });
};

const startConsumers = async () => {
  await consumeEvents(
    'housekeeping_queue',
    ['booking.checkedOut'],
    { 'booking.checkedOut': handleCheckout }
  );

  logger.info('Housekeeping consumers started');
};

module.exports = { startConsumers };