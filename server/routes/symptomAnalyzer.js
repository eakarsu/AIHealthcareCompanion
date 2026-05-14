// Symptom-to-specialist routing with likelihood-ranked suggestions.
// Audit: batch_04.md / AIHealthcareCompanion / Custom Feature Suggestions #4
import express from 'express';
import prisma from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { callOpenRouterAI } from '../services/openRouterAI.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();
router.use(authenticateToken);

function parseJSON(t) { try { const m = t.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); } catch (_) {} return { notes: t }; }

// POST /api/symptom-analyzer/analyze { symptoms, duration_days?, severity_1_10? }
router.post('/analyze', aiRateLimiter, async (req, res) => {
  try {
    const { symptoms, duration_days, severity_1_10, age, sex } = req.body || {};
    if (!symptoms) return res.status(400).json({ error: 'symptoms required' });

    let history = [];
    try {
      history = await prisma.medicalHistory.findMany({
        where: { userId: req.user.id },
        take: 20,
        orderBy: { createdAt: 'desc' }
      });
    } catch (_) {}
    let meds = [];
    try {
      meds = await prisma.medication.findMany({
        where: { userId: req.user.id },
        take: 20
      });
    } catch (_) {}

    const systemPrompt = `You are a triage assistant (NOT a doctor). Given a symptom description and patient
history, output (1) plausible specialty referrals, (2) red-flag escalation cues, and (3) self-care steps.
Always recommend professional evaluation. Return STRICT JSON only.`;

    const userPrompt = `Symptoms: ${symptoms}
Duration (days): ${duration_days || 'unspecified'}
Severity (1-10): ${severity_1_10 || 'unspecified'}
Age: ${age || 'unspecified'}; Sex: ${sex || 'unspecified'}
Medical history (sample): ${JSON.stringify(history.slice(0, 10))}
Current medications (sample): ${JSON.stringify(meds.slice(0, 10))}

Return JSON:
{
  "summary": "...",
  "specialist_routing": [{ "specialty": "string", "likelihood_pct": 0, "rationale": "string" }],
  "urgency_level": "self_care|primary_care_soon|urgent_care|emergency_now",
  "red_flag_symptoms_to_watch": ["..."],
  "self_care_steps": ["..."],
  "questions_to_bring_to_provider": ["..."],
  "disclaimer": "Educational; not a diagnosis. Seek licensed medical care."
}`;

    const raw = await callOpenRouterAI(systemPrompt, userPrompt);
    res.json({ analysis: parseJSON(raw) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/history', async (req, res) => {
  try {
    const items = await prisma.medicalHistory.findMany({
      where: { userId: req.user.id },
      take: 50,
      orderBy: { createdAt: 'desc' }
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
