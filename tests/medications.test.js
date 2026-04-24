import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { createTestUser, generateToken, cleanupTestUser, createMedicationsApp, prisma } from './helpers.js';

describe('Medication Routes', () => {
  let app;
  let testUser;
  let authToken;
  let createdMedicationId;

  const sampleMedication = {
    name: 'Ibuprofen',
    dosage: '200mg',
    frequency: 'Twice daily',
    timeOfDay: 'Morning and Evening',
    startDate: '2025-01-01',
    purpose: 'Pain relief',
    sideEffects: 'Nausea',
    notes: 'Take with food'
  };

  beforeAll(async () => {
    await prisma.$connect();
    app = await createMedicationsApp();
    testUser = await createTestUser();
    authToken = generateToken(testUser);
  });

  afterAll(async () => {
    try {
      await cleanupTestUser(testUser.id);
    } catch (e) {
      // User may already be cleaned up
    }
    await prisma.$disconnect();
  });

  describe('POST /api/medications', () => {
    it('should create a medication', async () => {
      const res = await request(app)
        .post('/api/medications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sampleMedication);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(sampleMedication.name);
      expect(res.body.dosage).toBe(sampleMedication.dosage);
      expect(res.body.frequency).toBe(sampleMedication.frequency);
      expect(res.body.purpose).toBe(sampleMedication.purpose);
      expect(res.body.userId).toBe(testUser.id);
      expect(res.body.isActive).toBe(true);

      // Save for later tests
      createdMedicationId = res.body.id;
    });

    it('should reject request without authentication', async () => {
      const res = await request(app)
        .post('/api/medications')
        .send(sampleMedication);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/medications', () => {
    it('should return medication list for authenticated user', async () => {
      const res = await request(app)
        .get('/api/medications')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);

      // The created medication should be in the list
      const found = res.body.find(m => m.id === createdMedicationId);
      expect(found).toBeDefined();
      expect(found.name).toBe(sampleMedication.name);
    });

    it('should reject request without authentication', async () => {
      const res = await request(app)
        .get('/api/medications');

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/medications/:id', () => {
    it('should update a medication', async () => {
      const res = await request(app)
        .put(`/api/medications/${createdMedicationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          dosage: '400mg',
          notes: 'Increased dosage per doctor advice'
        });

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createdMedicationId);
      expect(res.body.dosage).toBe('400mg');
      expect(res.body.notes).toBe('Increased dosage per doctor advice');
      // Name should remain unchanged
      expect(res.body.name).toBe(sampleMedication.name);
    });

    it('should reject update without authentication', async () => {
      const res = await request(app)
        .put(`/api/medications/${createdMedicationId}`)
        .send({ dosage: '600mg' });

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/medications/:id', () => {
    it('should delete a medication', async () => {
      const res = await request(app)
        .delete(`/api/medications/${createdMedicationId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should confirm deletion - medication no longer in list', async () => {
      const res = await request(app)
        .get('/api/medications')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      const found = res.body.find(m => m.id === createdMedicationId);
      expect(found).toBeUndefined();
    });

    it('should reject delete without authentication', async () => {
      const res = await request(app)
        .delete('/api/medications/999999')

      expect(res.status).toBe(401);
    });
  });
});
