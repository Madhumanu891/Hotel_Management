require('./setup');
const request  = require('supertest');
const app      = require('../src/app');
const mongoose = require('mongoose');
const Property = require('../src/models/Property.model');
const RoomType = require('../src/models/RoomType.model');
const Room     = require('../src/models/Room.model');
const jwt      = require('jsonwebtoken');

// Helper — generate a token for testing
const makeToken = (role = 'super_admin') =>
  jwt.sign(
    { userId: new mongoose.Types.ObjectId().toString(), role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

const adminToken = makeToken('super_admin');
const guestToken = makeToken('guest');

// Helper — create a full property with room type and rooms
const createTestProperty = async () => {
  const property = await Property.create({
    name:       'Test Hotel',
    starRating: 4,
    location: {
      address: '123 Test Street',
      city:    'Hyderabad',
      state:   'Telangana',
      country: 'India',
    },
    amenities: ['wifi', 'pool'],
  });

  const roomType = await RoomType.create({
    propertyId:   property._id,
    name:         'Standard Room',
    basePrice:    5000,
    maxOccupancy: 2,
  });

  await Room.insertMany([
    { propertyId: property._id, roomTypeId: roomType._id, roomNumber: '101', floor: 1 },
    { propertyId: property._id, roomTypeId: roomType._id, roomNumber: '102', floor: 1 },
  ]);

  return { property, roomType };
};

// ── PROPERTY CRUD TESTS ───────────────────────────────────────────────────────
describe('POST /api/properties', () => {

  it('should create a property as super_admin', async () => {
    const res = await request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name:       'Grand Hotel Hyderabad',
        starRating: 5,
        location: {
          address: '1 Hotel Road',
          city:    'Hyderabad',
          state:   'Telangana',
          country: 'India',
        },
        amenities: ['wifi', 'pool', 'gym'],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe('grand-hotel-hyderabad');
  });

  it('should reject creation without token', async () => {
    const res = await request(app)
      .post('/api/properties')
      .send({ name: 'Test', starRating: 3, location: { city: 'Mumbai' } });

    expect(res.statusCode).toBe(401);
  });

  it('should reject creation as guest', async () => {
    const res = await request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ name: 'Test', starRating: 3, location: { city: 'Mumbai' } });

    expect(res.statusCode).toBe(403);
  });

  it('should reject missing star rating', async () => {
    const res = await request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test Hotel', location: { city: 'Mumbai', state: 'MH', address: '123' } });

    expect(res.statusCode).toBe(422);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

});

describe('GET /api/properties', () => {

  beforeEach(createTestProperty);

  it('should return list of properties', async () => {
    const res = await request(app).get('/api/properties');
    expect(res.statusCode).toBe(200);
    expect(res.body.properties).toBeDefined();
    expect(res.body.properties.length).toBeGreaterThan(0);
  });

  it('should filter by city', async () => {
    const res = await request(app).get('/api/properties?city=Hyderabad');
    expect(res.statusCode).toBe(200);
    expect(res.body.properties.every(p => p.location.city === 'Hyderabad')).toBe(true);
  });

  it('should return empty for non-existent city', async () => {
    const res = await request(app).get('/api/properties?city=NonExistentCity');
    expect(res.statusCode).toBe(200);
    expect(res.body.properties.length).toBe(0);
  });

  it('should return pagination info', async () => {
    const res = await request(app).get('/api/properties?page=1&limit=5');
    expect(res.statusCode).toBe(200);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(5);
  });

});

describe('GET /api/properties/:slug', () => {

  it('should return property by slug', async () => {
    const { property } = await createTestProperty();
    const res = await request(app).get(`/api/properties/${property.slug}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.name).toBe('Test Hotel');
  });

  it('should return 404 for non-existent slug', async () => {
    const res = await request(app).get('/api/properties/non-existent-hotel');
    expect(res.statusCode).toBe(404);
  });

});

// ── ROOM TYPE TESTS ───────────────────────────────────────────────────────────
describe('POST /api/properties/:id/room-types', () => {

  it('should create a room type', async () => {
    const { property } = await createTestProperty();
    const res = await request(app)
      .post(`/api/properties/${property._id}/room-types`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name:         'Deluxe Room',
        basePrice:    8000,
        maxOccupancy: 2,
        bedConfiguration: '1 King Bed',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.name).toBe('Deluxe Room');
  });

  it('should reject invalid base price', async () => {
    const { property } = await createTestProperty();
    const res = await request(app)
      .post(`/api/properties/${property._id}/room-types`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Room', basePrice: -100, maxOccupancy: 2 });

    expect(res.statusCode).toBe(422);
  });

});

// ── ROOM TESTS ────────────────────────────────────────────────────────────────
describe('POST /api/properties/:id/rooms', () => {

  it('should create a room', async () => {
    const { property, roomType } = await createTestProperty();
    const res = await request(app)
      .post(`/api/properties/${property._id}/rooms`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        roomTypeId: roomType._id,
        roomNumber: '201',
        floor:      2,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.roomNumber).toBe('201');
  });

  it('should reject duplicate room number', async () => {
    const { property, roomType } = await createTestProperty();
    const res = await request(app)
      .post(`/api/properties/${property._id}/rooms`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        roomTypeId: roomType._id,
        roomNumber: '101', // already exists from createTestProperty
        floor:      1,
      });

    expect(res.statusCode).toBe(409); // Mongo duplicate key
  });

});

// ── AVAILABILITY SEARCH TESTS ─────────────────────────────────────────────────
describe('GET /api/properties/search/available', () => {

  beforeEach(createTestProperty);

  it('should return available properties', async () => {
    const res = await request(app)
      .get('/api/properties/search/available')
      .query({
        city:     'Hyderabad',
        checkIn:  '2027-04-10',
        checkOut: '2027-04-13',
        adults:   2,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.properties).toBeDefined();
    expect(res.body.searchParams.city).toBe('Hyderabad');
  });

  it('should reject missing check-in date', async () => {
    const res = await request(app)
      .get('/api/properties/search/available')
      .query({ city: 'Hyderabad', checkOut: '2027-04-13' });

    expect(res.statusCode).toBe(422);
  });

  it('should reject past check-in date', async () => {
    const res = await request(app)
      .get('/api/properties/search/available')
      .query({
        city:     'Hyderabad',
        checkIn:  '2020-01-01',
        checkOut: '2020-01-05',
      });

    expect(res.statusCode).toBe(400);
  });

  it('should reject check-out before check-in', async () => {
    const res = await request(app)
      .get('/api/properties/search/available')
      .query({
        city:     'Hyderabad',
        checkIn:  '2027-04-13',
        checkOut: '2027-04-10',
      });

    expect(res.statusCode).toBe(400);
  });

  it('should return pricing breakdown', async () => {
    const res = await request(app)
      .get('/api/properties/search/available')
      .query({
        city:     'Hyderabad',
        checkIn:  '2027-04-10',
        checkOut: '2027-04-13',
        adults:   1,
      });

    expect(res.statusCode).toBe(200);
    if (res.body.properties.length > 0) {
      const roomType = res.body.properties[0].availableRoomTypes[0];
      expect(roomType.pricing.nights).toBe(3);
      expect(roomType.pricing.taxAmount).toBeDefined();
      expect(roomType.pricing.totalAmount).toBeDefined();
    }
  });

});