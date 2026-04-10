const mongoose = require('mongoose');

// ✅ Correct RabbitMQ mock
jest.mock('../../shared/events/rabbitmq', () => ({
  connect:        jest.fn().mockResolvedValue(true),
  publishEvent:   jest.fn().mockResolvedValue(true),
  consumeEvents:  jest.fn().mockResolvedValue(true),
  closeConnection:jest.fn().mockResolvedValue(true),
}));

// ✅ Correct Redis mock (ONLY if this file exists)
jest.mock('../src/config/redis', () => ({
  connectRedis:   jest.fn(),
  getRedisClient: jest.fn(() => ({
    get:    jest.fn().mockResolvedValue(null),
    setex:  jest.fn().mockResolvedValue('OK'),
    del:    jest.fn().mockResolvedValue(1),
    keys:   jest.fn().mockResolvedValue([]),
  })),
}));

beforeAll(async () => {
  const testUri = process.env.MONGO_URI.replace(
    'hotel_property_db',
    'hotel_property_test'
  );
  await mongoose.connect(testUri);
}, 30000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
}, 30000);