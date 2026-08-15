import 'dotenv/config';

import { generatedFeatureDefinitions } from '../server/routes/generatedFeatures.js';

const baseUrl = process.env.AI_FEATURE_BASE_URL || `http://127.0.0.1:${process.env.PORT || process.env.BACKEND_PORT || 30318}`;
const credentialKeys = [
  ['SEED_ADMIN_EMAIL', 'SEED_ADMIN_PASSWORD'],
  ['ADMIN_EMAIL', 'ADMIN_PASSWORD'],
  ['DEMO_EMAIL', 'DEMO_PASSWORD'],
  ['DEFAULT_EMAIL', 'DEFAULT_PASSWORD'],
  ['PROVISION_ADMIN_EMAIL', 'PROVISION_ADMIN_PASSWORD'],
];

let token = '';
for (const [emailKey, passwordKey] of credentialKeys) {
  if (!process.env[emailKey] || !process.env[passwordKey]) continue;
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: process.env[emailKey], password: process.env[passwordKey] }),
  });
  if (!response.ok) continue;
  const body = await response.json();
  token = body.token || body.accessToken || body.data?.token || '';
  if (token) break;
}
if (!token) throw new Error('Configured login failed');

const results = [];
for (let index = 0; index < generatedFeatureDefinitions.length; index += 3) {
  const batch = generatedFeatureDefinitions.slice(index, index + 3);
  const rows = await Promise.all(batch.map(async ({ slug }) => {
    try {
      const response = await fetch(`${baseUrl}/api/${slug}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({
          input: 'Runtime verification: return a concise safe operational summary and one next step.',
          context: { test: true },
        }),
        signal: AbortSignal.timeout(90_000),
      });
      const body = await response.json().catch(() => ({}));
      return {
        slug,
        status: response.status,
        hasResult: typeof body.result === 'string' && body.result.length > 10,
        hasModel: Boolean(body.model),
        error: response.ok ? undefined : String(body.error || 'unknown').slice(0, 100),
      };
    } catch (error) {
      return { slug, status: 0, hasResult: false, hasModel: false, error: error.name };
    }
  }));
  results.push(...rows);
}

const passed = results.filter((result) => result.status === 200 && result.hasResult && result.hasModel).length;
console.log(JSON.stringify({ login: 200, total: results.length, passed, results }, null, 2));
if (passed !== results.length) process.exitCode = 1;
