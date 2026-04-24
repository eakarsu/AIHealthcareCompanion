import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { createTestUser, generateToken, cleanupTestUser, createAuthApp, prisma } from './helpers.js';

describe('Auth Routes', () => {
  let app;
  const testUsers = [];

  beforeAll(async () => {
    await prisma.$connect();
    app = await createAuthApp();
  });

  afterAll(async () => {
    // Clean up all test users created during tests
    for (const userId of testUsers) {
      try {
        await cleanupTestUser(userId);
      } catch (e) {
        // User may already be deleted or never fully created
      }
    }
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const uniqueEmail = `register-test-${Date.now()}@test.com`;

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: uniqueEmail,
          password: 'testpass123',
          name: 'Register Test User'
        });

      // The auth route returns 200 with a JSON body containing token and user
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(uniqueEmail);
      expect(res.body.user.name).toBe('Register Test User');

      // Track user for cleanup
      testUsers.push(res.body.user.id);
    });

    it('should reject registration with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'incomplete@test.com'
          // missing password and name
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject registration with short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: `short-pass-${Date.now()}@test.com`,
          password: '123',
          name: 'Short Pass User'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/at least 6 characters/);
    });

    it('should reject duplicate email registration', async () => {
      const user = await createTestUser();
      testUsers.push(user.id);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: user.email,
          password: 'testpass123',
          name: 'Duplicate User'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/already exists/);
    });
  });

  describe('POST /api/auth/login', () => {
    let loginUser;

    beforeAll(async () => {
      loginUser = await createTestUser();
      testUsers.push(loginUser.id);
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: loginUser.email,
          password: 'testpass123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(loginUser.email);
    });

    it('should fail with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: loginUser.email,
          password: 'wrongpassword'
        });

      // The auth route returns 400 for invalid credentials
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('should fail with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@nowhere.com',
          password: 'testpass123'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    let meUser;
    let meToken;

    beforeAll(async () => {
      meUser = await createTestUser();
      testUsers.push(meUser.id);
      meToken = generateToken(meUser);
    });

    it('should return user profile when authenticated', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${meToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.id).toBe(meUser.id);
      expect(res.body.user.email).toBe(meUser.email);
      expect(res.body.user.name).toBe(meUser.name);
      // Password should not be returned
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('No token provided');
    });

    it('should return 403 with an invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token-value');

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Invalid token');
    });
  });
});
