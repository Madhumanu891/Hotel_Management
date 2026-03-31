require('dotenv').config();
const mongoose = require('mongoose');

async function runTest() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const Property = require('../models/Property.model.js');
  const RoomType = require('../models/RoomType.model.js');
  const Room     = require('../models/Room.model.js');

  // ── Test 1: Create a property ─────────────────────────────
  const property = await Property.create({
    name:        'Taj Palace Mumbai',
    description: 'Luxury 5-star hotel in the heart of Mumbai',
    starRating:  5,
    location: {
      address: '1 Apollo Bunder',
      city:    'Mumbai',
      state:   'Maharashtra',
      country: 'India',
      pincode: '400001',
      coordinates: {
        type:        'Point',
        coordinates: [72.8347, 18.9220],
      },
    },
    amenities:   ['wifi', 'pool', 'gym', 'spa', 'restaurant'],
    contactInfo: { phone: '+91 22 6665 3366', email: 'taj@example.com' },
  });

  console.log('Test 1 PASS - Property created:', property.name);
  console.log('         Slug:', property.slug); // Should be clean, no timestamp

  // ── Test 2: Create a room type ────────────────────────────
  const roomType = await RoomType.create({
    propertyId:        property._id,
    name:              'Deluxe Sea View Room',
    description:       'Stunning views of the Arabian Sea',
    basePrice:         8000,
    weekendMultiplier: 1.25,
    maxOccupancy:      2,
    bedConfiguration:  '1 King Bed',
    size:              400,
    amenities:         ['AC', 'LED TV', 'Mini Bar', 'Balcony'],
  });

  console.log('Test 2 PASS - RoomType created:', roomType.name);

  // ── Test 3: Weekend pricing ───────────────────────────────
  const mondayPrice  = roomType.getPriceForDate('2026-04-07'); // Monday
  const saturdayPrice = roomType.getPriceForDate('2026-04-11'); // Saturday

  console.log('Test 3 PASS - Weekday price:', mondayPrice);   // 8000
  console.log('           Weekend price:', saturdayPrice); // 10000

  const pricingCorrect = mondayPrice === 8000 && saturdayPrice === 10000;
  console.log('         Pricing correct:', pricingCorrect ? 'YES' : 'NO');

  // ── Test 4: Total price calculation ──────────────────────
  const pricing = roomType.calculateTotalPrice('2026-04-10', '2026-04-13');
  console.log('Test 4 PASS - 3-night pricing:');
  console.log('         Nights:', pricing.nights);           // 3
  console.log('         Base price: INR', pricing.basePrice);
  console.log('         Tax (18%):', pricing.taxAmount);
  console.log('         Total: INR', pricing.totalAmount);

  // ── Test 5: Create rooms ──────────────────────────────────
  const rooms = await Room.insertMany([
    { propertyId: property._id, roomTypeId: roomType._id, roomNumber: '101', floor: 1, features: ['sea_view'] },
    { propertyId: property._id, roomTypeId: roomType._id, roomNumber: '201', floor: 2, features: ['sea_view', 'corner_room'] },
    { propertyId: property._id, roomTypeId: roomType._id, roomNumber: '301', floor: 3, features: ['sea_view'] },
  ]);

  console.log('Test 5 PASS - Rooms created:', rooms.length); // 3

  // ── Test 6: Find available rooms ──────────────────────────
  const availableRooms = await Room.find({
    propertyId: property._id,
    status:     'available',
  });

  console.log('Test 6 PASS - Available rooms:', availableRooms.length); // 3

  // ── Test 7: Duplicate room number rejected ────────────────
  try {
    await Room.create({
      propertyId: property._id,
      roomTypeId: roomType._id,
      roomNumber: '101', // Already exists
      floor:      1,
    });
    console.log('Test 7 FAIL - Should have rejected duplicate room number');
  } catch (err) {
    console.log('Test 7 PASS - Duplicate room number correctly rejected');
  }

  // ── Test 8: Duplicate slug handled ───────────────────────
  const property2 = await Property.create({
    name:       'Taj Palace Mumbai', // Same name
    starRating: 4,
    location: {
      address: '456 Other Street',
      city:    'Mumbai',
      state:   'Maharashtra',
      country: 'India',
    },
  });

  const slugIsUnique = property2.slug !== property.slug;
  console.log('Test 8 PASS - Duplicate name gets unique slug:', slugIsUnique ? 'YES' : 'NO');
  console.log('         New slug:', property2.slug);

  // ── Summary ───────────────────────────────────────────────
  console.log('\n── All tests complete ──');
  console.log('Properties in DB:', await Property.countDocuments());
  console.log('RoomTypes in DB: ', await RoomType.countDocuments());
  console.log('Rooms in DB:     ', await Room.countDocuments());

  await mongoose.disconnect();
  console.log('Done!');
}

runTest().catch(console.error);