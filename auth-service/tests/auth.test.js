require('./setup');
const request  = require('supertest');
const app      = require('../src/app');
const mongoose = require('mongoose');
const User     = require('../src/models/User.model');

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER TESTS
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/auth/register', () => {

  it('should register a new guest successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'guest@test.com', password: 'Test1234!', name: 'Test Guest' });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe('guest@test.com');
    expect(res.body.data.user.role).toBe('guest');
  });

  it('should reject duplicate email with 409', async () => {
    // Create user first
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'guest@test.com', password: 'Test1234!' });

    // Try to register again with same email
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'guest@test.com', password: 'Test1234!' });

    expect(res.statusCode).toBe(409);
    expect(res.body.code).toBe('CONFLICT');
  });

  it('should reject missing email with 422', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ password: 'Test1234!' });

    expect(res.statusCode).toBe(422);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('should reject invalid email format with 422', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'notanemail', password: 'Test1234!' });

    expect(res.statusCode).toBe(422);
  });

  it('should reject password shorter than 8 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'guest@test.com', password: 'Ab1!' });

    expect(res.statusCode).toBe(422);
    expect(res.body.errors[0].message).toContain('8 characters');
  });

  it('should reject password without uppercase letter', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'guest@test.com', password: 'test1234!' });

    expect(res.statusCode).toBe(422);
    expect(res.body.errors.some(e => e.message.includes('uppercase'))).toBe(true);
  });

  it('should not return passwordHash in response', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'guest@test.com', password: 'Test1234!' });

    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN TESTS
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {

  // Create a user before each login test
  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'guest@test.com', password: 'Test1234!' });
  });

  it('should login successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'guest@test.com', password: 'Test1234!' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe('guest@test.com');
  });

  it('should set refreshToken as httpOnly cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'guest@test.com', password: 'Test1234!' });

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some(c => c.startsWith('refreshToken='))).toBe(true);
    expect(cookies.some(c => c.includes('HttpOnly'))).toBe(true);
  });

  it('should reject wrong password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'guest@test.com', password: 'WrongPass1!' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('should reject non-existent email with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'Test1234!' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('should return same error for wrong email and wrong password', async () => {
    const wrongEmail = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'Test1234!' });

    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ email: 'guest@test.com', password: 'WrongPass1!' });

    // Same message — prevents user enumeration
    expect(wrongEmail.body.message).toBe(wrongPassword.body.message);
  });

  it('should lock account after 5 failed attempts', async () => {
    // Fail 5 times
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'guest@test.com', password: 'WrongPass1!' });
    }

    // 6th attempt with correct password should be rejected
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'guest@test.com', password: 'Test1234!' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toContain('locked');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// PROTECT MIDDLEWARE TESTS
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/auth/me', () => {

  let accessToken;

  beforeEach(async () => {
    // Register and login to get token
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'guest@test.com', password: 'Test1234!' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'guest@test.com', password: 'Test1234!' });

    accessToken = loginRes.body.data.accessToken;
  });

  it('should return user profile with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.email).toBe('guest@test.com');
  });

  it('should reject request with no token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toContain('No token');
  });

  it('should reject request with fake token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer thisisafaketoken');

    expect(res.statusCode).toBe(401);
  });

  it('should reject request with malformed header', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'NotBearer sometoken');

    expect(res.statusCode).toBe(401);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// LOGOUT TESTS
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/auth/logout', () => {

  let accessToken;

  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'guest@test.com', password: 'Test1234!' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'guest@test.com', password: 'Test1234!' });

    accessToken = loginRes.body.data.accessToken;
  });

  it('should logout successfully', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should blacklist token after logout', async () => {
    // Logout
    await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    // Try to use the same token
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toContain('invalidated');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// FORGOT PASSWORD TESTS
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/auth/forgot-password', () => {

  it('should return 200 for existing email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'guest@test.com', password: 'Test1234!' });

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'guest@test.com' });

    expect(res.statusCode).toBe(200);
  });

  it('should return same 200 for non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nobody@test.com' });

    // Same response regardless — prevents enumeration
    expect(res.statusCode).toBe(200);
  });

  it('should save reset token to database', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'guest@test.com', password: 'Test1234!' });

    await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'guest@test.com' });

    // Check token was saved in DB
    const user = await User
      .findOne({ email: 'guest@test.com' })
      .select('+passwordResetToken +passwordResetExpires');

    expect(user.passwordResetToken).toBeDefined();
    expect(user.passwordResetExpires).toBeDefined();
    expect(user.passwordResetExpires > Date.now()).toBe(true);
  });

});