// Medication adherence AI predicting missed doses and adapting reminders.
// Audit: batch_04.md / AIHealthcareCompanion / Custom Feature Suggestions #3
import express from 'express';
import prisma from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { callOpenRouterAI } from '../services/openRouterAI.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();
router.use(authenticateToken);

function parseJSON(t) { try { const m = t.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); } catch (_) {} return { notes: t }; }

// POST /api/medication-adherence/predict
router.post('/predict', aiRateLimiter, async (req, res) => {
  try {
    let meds = [];
    try {
      meds = await prisma.medication.findMany({
        where: { userId: req.user.id },
        take: 30,
        orderBy: { createdAt: 'desc' }
      });
    } catch (_) {}

    const systemPrompt = `You are a medication adherence coach. Predict which doses are at risk of being missed
based on regimen complexity, side-effect signals, and behavioral patterns. Recommend adapted reminders. Return
STRICT JSON only.`;

    const userPrompt = `Medications: ${JSON.stringify(meds)}

Return JSON:
{
  "summary": "...",
  "at_risk_medications": [
    { "medication_id": "string", "name": "string", "miss_probability_pct": 0, "risk_factors": ["..."], "recommended_reminder_strategy": { "channel": "push|sms|email|smart_speaker", "cadence": "string", "messaging_tone": "string" } }
  ],
  "regimen_simplification_suggestions": ["..."],
  "weekly_adherence_score_estimate": 0,
  "disclaimer": "Behavioral coaching only; consult prescriber before changing schedule."
}`;

    const raw = await callOpenRouterAI(systemPrompt, userPrompt);
    res.json({ medication_count: meds.length, prediction: parseJSON(raw) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/medication-adherence/log-dose { medication_id, taken_at, missed? }
router.post('/log-dose', async (req, res) => {
  try {
    const { medication_id, taken_at, missed = false, notes } = req.body || {};
    if (!medication_id) return res.status(400).json({ error: 'medication_id required' });
    try {
      // Lazy schema bootstrap via raw SQL (Prisma model may not exist yet).
      await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "MedicationDoseLog" (
        id SERIAL PRIMARY KEY, "userId" INTEGER, "medicationId" INTEGER,
        "takenAt" TIMESTAMPTZ, missed BOOLEAN DEFAULT FALSE, notes TEXT,
        "createdAt" TIMESTAMPTZ DEFAULT NOW()
      )`);
      await prisma.$executeRawUnsafe(
        `INSERT INTO "MedicationDoseLog" ("userId", "medicationId", "takenAt", missed, notes) VALUES ($1,$2,$3,$4,$5)`,
        req.user.id, medication_id, taken_at || new Date(), missed, notes || null
      );
    } catch (_) {}
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
