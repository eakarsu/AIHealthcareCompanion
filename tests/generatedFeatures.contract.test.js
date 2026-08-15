import { describe, expect, it } from '@jest/globals';
import express from 'express';
import fs from 'fs';
import path from 'path';
import request from 'supertest';

import generatedFeatureRoutes, { generatedFeatureDefinitions } from '../server/routes/generatedFeatures.js';
import { generateToken } from './helpers.js';

function clientFeatureRoutes() {
  const pagesDirectory = path.resolve('client/src/pages');
  return fs.readdirSync(pagesDirectory)
    .filter((file) => /^(Cf|Gap).*\.jsx$/.test(file))
    .map((file) => fs.readFileSync(path.join(pagesDirectory, file), 'utf8').match(/fetch\(['"]\/api\/([^'"]+)/)?.[1])
    .filter(Boolean)
    .sort();
}

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api', generatedFeatureRoutes);
  return app;
}

describe('generated AI feature route contract', () => {
  it('registers every generated client AI endpoint exactly once', () => {
    const serverRoutes = generatedFeatureDefinitions.map(({ slug }) => slug).sort();
    expect(serverRoutes).toEqual(clientFeatureRoutes());
    expect(new Set(serverRoutes).size).toBe(19);
  });

  it('exposes all routes behind authentication instead of returning 404', async () => {
    const app = createApp();
    for (const { slug } of generatedFeatureDefinitions) {
      const response = await request(app).post(`/api/${slug}`).send({ input: 'test request' });
      expect(response.status).toBe(401);
    }
  });

  it('validates input before calling the AI provider', async () => {
    const app = createApp();
    const token = generateToken({ id: 1, email: 'contract@example.com', role: 'user' });
    const response = await request(app)
      .post('/api/gap-no-provider-portal-share-data-with')
      .set('Authorization', `Bearer ${token}`)
      .send({ input: '' });
    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/at least 3 characters/);
  });
});
