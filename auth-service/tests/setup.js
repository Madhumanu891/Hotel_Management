require('dotenv').config();
const mongoose = require('mongoose');

// ── Mock RabbitMQ ──────────────────────────────────────────────────────────────
jest.mock('../../shared/events/rabbitmq', () => ({   // adjust path if needed
  connect:         jest.fn().mockResolvedValue(true),
  publishEvent:    jest.fn().mockResolvedValue(true),
  consumeEvents:   jest.fn().mockResolvedValue(true),
  closeConnection: jest.fn().mockResolvedValue(true),
}));

// ── Mock Redis ─────────────────────────────────────────────────────────────────
jest.mock('../src/config/redis', () => {
  const store = new Map();

  const mockRedisClient = {
    get:   jest.fn(async (key)             => store.get(key) ?? null),
    setex: jest.fn(async (key, ttl, value) => { store.set(key, value); return 'OK'; }),
    set:   jest.fn(async (key, value)      => { store.set(key, value); return 'OK'; }),
    del:   jest.fn(async (key)             => { store.delete(key); return 1; }),
    quit:  jest.fn(async ()                => 'OK'),
  };

  return {
    connectRedis:   jest.fn().mockResolvedValue(true),
    getRedisClient: jest.fn(() => mockRedisClient),
  };
});

// ── Database lifecycle ─────────────────────────────────────────────────────────
beforeAll(async () => {
  const testUri = process.env.MONGO_URI.replace('hotel_auth_db', 'hotel_auth_test');
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