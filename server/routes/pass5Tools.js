// Apply pass 5 — additive AI advisory endpoints.
// Works against existing Prisma models (Medication, PhysicalTherapy, MedicalHistory)
// without modifying schema. 503-on-no-key pattern. Healthcare disclaimers preserved.

import express from 'express';
import prisma from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { callOpenRouterAI, parseStructuredResponse } from '../services/openRouterAI.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

function noKeyGuard(res) {
  if (!process.env.OPENROUTER_API_KEY) {
    res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured' });
    return true;
  }
  return false;
}

// ---- Symptom triage --------------------------------------------------------
// POST /api/pass5/symptom-analyzer  { symptoms: string, duration?: string,
//                                     severity?: 1-10, age?: number, context?: string }
// Returns triage advisory. NOT a clinical diagnosis.
router.post('/symptom-analyzer', authenticateToken, aiRateLimiter, async (req, res) => {
  if (noKeyGuard(res)) return;
  try {
    const { symptoms, duration, severity, age, context } = req.body || {};
    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length < 3) {
      return res.status(400).json({ error: 'symptoms (string) is required' });
    }
    const systemPrompt = `You are a triage AI assistant. Provide a structured TRIAGE ADVISORY for the user-reported symptoms below. This is NOT a clinical diagnosis. ALWAYS recommend consulting a healthcare professional for diagnosis or in any urgent scenario. Return JSON: {severity_level: "self-care"|"non-urgent"|"urgent"|"emergency"|"unsure", possible_categories: string[] (broad differential categories, NOT specific diagnoses), red_flags_to_watch: string[], recommended_action: string, when_to_seek_care: string, self_care_steps: string[], questions_to_track: string[], disclaimer: string}.`;
    const userMessage = `Symptoms: ${symptoms}\nDuration: ${duration || 'not specified'}\nSeverity (1-10): ${severity ?? 'not specified'}\nAge: ${age ?? 'not specified'}\nContext: ${context || 'none'}`;

    const ai = await callOpenRouterAI(systemPrompt, userMessage);
    if (ai.error) return res.status(502).json({ error: ai.error });
    const parsed = parseStructuredResponse(ai.content);
    res.json({
      content: ai.content,
      structured: parsed,
      model: ai.model,
      usage: ai.usage,
      disclaimer: 'For informational purposes only. Not a substitute for professional medical advice, diagnosis, or treatment.',
    });
  } catch (err) {
    console.error('Symptom analyzer error:', err);
    res.status(500).json({ error: 'Failed to analyze symptoms' });
  }
});

// ---- Medication adherence advisor ------------------------------------------
// POST /api/pass5/medication-adherence-advisor  { medication_id?: number }
// Uses existing Medication frequency/timeOfDay/startDate/endDate fields.
router.post('/medication-adherence-advisor', authenticateToken, aiRateLimiter, async (req, res) => {
  if (noKeyGuard(res)) return;
  try {
    const { medication_id } = req.body || {};
    let meds;
    if (medication_id) {
      const m = await prisma.medication.findFirst({ where: { id: Number(medication_id), userId: req.user.id } });
      if (!m) return res.status(404).json({ error: 'medication not found' });
      meds = [m];
    } else {
      meds = await prisma.medication.findMany({
        where: { userId: req.user.id, isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 30,
      });
    }
    if (!meds.length) return res.status(400).json({ error: 'no medications found' });

    const systemPrompt = `You are an adherence-coaching AI. Given a patient's active medications, recommend a personalized reminder schedule that minimizes missed doses, considers time-of-day clustering, and proactively flags adherence risks. NOT a prescriber. Always preserve the patient's prescribed dosage/frequency. Return JSON: {schedule_recommendations: [{medication_id, name, recommended_times: string[], rationale, conflicts: string[]}], adherence_risks: string[], reminder_strategies: string[], lifestyle_tips: string[], disclaimer: string}.`;
    const userMessage = `Active medications:\n${meds.map(m => `- id=${m.id} ${m.name} dose=${m.dosage} freq=${m.frequency} time=${m.timeOfDay} purpose=${m.purpose} active=${m.isActive}`).join('\n')}`;

    const ai = await callOpenRouterAI(systemPrompt, userMessage);
    if (ai.error) return res.status(502).json({ error: ai.error });
    const parsed = parseStructuredResponse(ai.content);
    res.json({
      content: ai.content,
      structured: parsed,
      model: ai.model,
      usage: ai.usage,
      disclaimer: 'Not medical advice. Confirm any reminder schedule with your prescriber and pharmacist.',
    });
  } catch (err) {
    console.error('Adherence advisor error:', err);
    res.status(500).json({ error: 'Failed to generate adherence plan' });
  }
});

// ---- PT progression analyzer (aggregate over time) ------------------------
// POST /api/pass5/therapy-progress-summary  { window_days?: number = 30 }
router.post('/therapy-progress-summary', authenticateToken, aiRateLimiter, async (req, res) => {
  if (noKeyGuard(res)) return;
  try {
    const windowDays = Math.max(7, Math.min(parseInt(req.body?.window_days) || 30, 365));
    const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);
    const sessions = await prisma.physicalTherapy.findMany({
      where: { userId: req.user.id, createdAt: { gte: since } },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });
    if (!sessions.length) return res.status(400).json({ error: 'no PT sessions in window' });

    const systemPrompt = `You are a physical-therapy progress AI. Summarize a patient's PT session series over the period and produce a structured progress report. Highlight trends, plateaus, regressions, and supportive next steps. NOT a substitute for the patient's PT clinician. Return JSON: {window_days: number, total_sessions: number, completed_sessions: number, key_trends: string[], plateaus: string[], regressions: string[], suggested_intensity_change: "increase"|"maintain"|"decrease"|"discuss_with_clinician", body_part_focus: object, recommendations: string[], disclaimer: string}.`;
    const userMessage = `Window: last ${windowDays} days. Sessions:\n${sessions.map(s => `- ${s.createdAt?.toISOString?.()} ${s.exerciseName} (${s.bodyPart}) duration=${s.duration} reps=${s.repetitions}x${s.sets} difficulty=${s.difficulty} status=${s.status}`).join('\n')}`;

    const ai = await callOpenRouterAI(systemPrompt, userMessage);
    if (ai.error) return res.status(502).json({ error: ai.error });
    const parsed = parseStructuredResponse(ai.content);
    res.json({
      content: ai.content,
      structured: parsed,
      window_days: windowDays,
      total_sessions: sessions.length,
      model: ai.model,
      usage: ai.usage,
      disclaimer: 'For informational purposes only. Discuss progress with your clinician.',
    });
  } catch (err) {
    console.error('Therapy progress error:', err);
    res.status(500).json({ error: 'Failed to summarize therapy progress' });
  }
});

export default router;
