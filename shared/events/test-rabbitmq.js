// ─── Set environment FIRST before requiring anything ──────
process.env.NODE_ENV = 'development';
process.env.SERVICE_NAME = 'test-service';
process.env.LOG_LEVEL = 'info';
process.env.RABBITMQ_URL = 'amqp://admin:admin123@localhost:5672';

// ─── Now require AFTER env is set ─────────────────────────
const { connect, publishEvent, consumeEvents, closeConnection } = require('./rabbitmq');

async function runTest() {
  console.log('─────────────────────────────────────────');
  console.log('Testing RabbitMQ Helper');
  console.log('─────────────────────────────────────────\n');

  try {
    // Step 1 — Connect
    console.log('Step 1: Connecting to RabbitMQ...');
    await connect();

    // Wait 1 second to make sure connection is ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('✅ Connected!\n');

    // Step 2 — Setup consumer FIRST
    console.log('Step 2: Setting up consumer...');

    await consumeEvents(
      'test_queue',
      ['booking.confirmed', 'payment.succeeded'],
      {
        'booking.confirmed': async (data) => {
          console.log('\n✅ Received booking.confirmed event!');
          console.log('   Guest:', data.guestName);
          console.log('   Hotel:', data.propertyName);
          console.log('   Amount: $' + data.totalAmount);
        },
        'payment.succeeded': async (data) => {
          console.log('\n✅ Received payment.succeeded event!');
          console.log('   Amount: $' + data.amount);
        }
      }
    );
    console.log('✅ Consumer ready!\n');

    // Step 3 — Publish test event
    console.log('Step 3: Publishing test event...');
    await publishEvent('booking.confirmed', {
      bookingId: 'BK-20250101-1234',
      guestName: 'John Doe',
      guestEmail: 'john@example.com',
      propertyName: 'Hotel Alpha Mumbai',
      checkIn: '2025-02-01',
      checkOut: '2025-02-03',
      totalAmount: 299.99
    });
    console.log('✅ Event published!\n');

    // Wait 3 seconds for consumer to receive it
    console.log('Waiting for consumer to receive message...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 4 — Close
    await closeConnection();

    console.log('\n─────────────────────────────────────────');
    console.log('✅ RabbitMQ test complete!');
    console.log('─────────────────────────────────────────');
    process.exit(0);

  } catch (err) {
    console.log('\n❌ Test failed:', err.message);
    console.log('Make sure Docker is running: docker ps');
    process.exit(1);
  }
}

runTest();