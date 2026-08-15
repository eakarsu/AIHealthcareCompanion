import express from 'express';

import { authenticateToken } from '../middleware/auth.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';
import { callOpenRouterAI } from '../services/openRouterAI.js';

export const generatedFeatureDefinitions = [
  ['cf-agentic-health-assistant-monitoring-tren', 'Agentic health assistant monitoring health trends'],
  ['cf-personalized-health-coaching-generating-', 'Personalized health coaching and adaptive daily goals'],
  ['cf-medication-adherence-ai-predicting-misse', 'Medication adherence and missed-dose risk'],
  ['cf-symptom-to-specialist-routing-with-likel', 'Symptom-to-specialist routing'],
  ['cf-preventive-health-roadmap-by-age-family', 'Preventive health roadmap'],
  ['cf-multimodal-health-dashboard-fusing-weara', 'Multimodal health dashboard analysis'],
  ['gap-no-symptom-analyzer-endpoint', 'Symptom analyzer'],
  ['gap-no-medication-interaction-checker', 'Medication interaction checker'],
  ['gap-no-therapy-progress-analyzer', 'Therapy progress analyzer'],
  ['gap-no-skin-lesion-vision-ai', 'Skin-lesion support'],
  ['gap-no-vision-test-interpreter', 'Vision-test interpreter'],
  ['gap-no-medication-adherence-pattern-model', 'Medication-adherence pattern model'],
  ['gap-no-provider-portal-share-data-with', 'Provider portal data-sharing plan'],
  ['gap-no-prescription-pharmacy-integration', 'Prescription and pharmacy integration plan'],
  ['gap-no-appointment-scheduling', 'Appointment scheduling plan'],
  ['gap-no-telemedicine', 'Telemedicine implementation plan'],
  ['gap-no-insurance-information-module', 'Insurance information workflow'],
  ['gap-no-lab-result-import', 'Lab-result import workflow'],
  ['gap-no-webhook-surface', 'Webhook integration plan'],
].map(([slug, title]) => ({ slug, title }));

const router = express.Router();

for (const feature of generatedFeatureDefinitions) {
  router.post(`/${feature.slug}`, authenticateToken, aiRateLimiter, async (req, res) => {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured' });
    }

    const input = typeof req.body?.input === 'string' ? req.body.input.trim() : '';
    if (input.length < 3) {
      return res.status(400).json({ error: 'input must contain at least 3 characters' });
    }
    if (input.length > 20_000) {
      return res.status(413).json({ error: 'input must not exceed 20,000 characters' });
    }

    const context = req.body?.context && typeof req.body.context === 'object' && !Array.isArray(req.body.context)
      ? req.body.context
      : {};
    const systemPrompt = [
      `You are the AI Healthcare Companion assistant for “${feature.title}”.`,
      'Return a structured, practical response with: summary, prioritized actions, risks, missing information, assumptions, and follow-up questions.',
      'Do not diagnose, prescribe, or claim certainty. Identify emergencies and recommend qualified medical care when appropriate.',
      'Protect patient privacy and do not request unnecessary identifying information.',
    ].join(' ');
    const userMessage = `Request:\n${input}\n\nContext:\n${JSON.stringify(context)}`;

    try {
      const ai = await callOpenRouterAI(systemPrompt, userMessage);
      if (ai.error) return res.status(502).json({ error: ai.error });
      return res.json({
        feature: feature.slug,
        title: feature.title,
        result: ai.content,
        model: ai.model,
        usage: ai.usage,
        disclaimer: 'For informational purposes only. This is not medical advice, diagnosis, or treatment.',
      });
    } catch (error) {
      console.error(`Generated AI feature failed (${feature.slug}):`, error);
      return res.status(500).json({ error: 'Failed to generate the AI response' });
    }
  });
}

export default router;
