require('dotenv').config();
const mongoose = require('mongoose');
const Redis = require('ioredis');
const amqp = require('amqplib');

console.log('🔍 Testing all connections...\n');

async function testMongoDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected!');
    console.log(`   URI: ${process.env.MONGO_URI}\n`);
    await mongoose.disconnect();
  } catch (err) {
    console.log('❌ MongoDB FAILED:', err.message, '\n');
  }
}

async function testRedis() {
  const redis = new Redis(process.env.REDIS_URL);
  try {
    const result = await redis.ping();
    console.log('✅ Redis connected!');
    console.log(`   Response: ${result}\n`);
    redis.disconnect();
  } catch (err) {
    console.log('❌ Redis FAILED:', err.message, '\n');
  }
}

async function testRabbitMQ() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    console.log('✅ RabbitMQ connected!');
    console.log(`   URL: ${process.env.RABBITMQ_URL}\n`);
    await connection.close();
  } catch (err) {
    console.log('❌ RabbitMQ FAILED:', err.message, '\n');
  }
}

async function runAll() {
  await testMongoDB();
  await testRedis();
  await testRabbitMQ();
  console.log('─────────────────────────────');
  console.log('All tests complete!');
  process.exit(0);
}

runAll();