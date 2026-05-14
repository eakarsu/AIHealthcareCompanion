import express from 'express';
import prisma from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { callOpenRouterAI, parseStructuredResponse, AI_PROMPTS } from '../services/openRouterAI.js';
import { getCached, setCached } from '../services/analysisCache.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Get all medical history for user (with pagination)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [history, total] = await Promise.all([
      prisma.medicalHistory.findMany({
        where: { userId: req.user.id },
        orderBy: { diagnosisDate: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.medicalHistory.count({ where: { userId: req.user.id } })
    ]);

    res.json({
      data: history,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get medical history error:', error);
    res.status(500).json({ error: 'Failed to fetch medical history' });
  }
});

// Get single medical history record
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const record = await prisma.medicalHistory.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.id }
    });
    if (!record) {
      return res.status(404).json({ error: 'Medical history record not found' });
    }
    res.json(record);
  } catch (error) {
    console.error('Get medical history error:', error);
    res.status(500).json({ error: 'Failed to fetch medical history' });
  }
});

// Get cached analysis
router.get('/:id/analysis/cached', authenticateToken, async (req, res) => {
  const cached = getCached('medicalhistory', req.params.id);
  if (cached) return res.json({ cached: true, ...cached });
  res.json({ cached: false });
});

// Create medical history record
router.post('/', authenticateToken, async (req, res) => {
  try {
    const record = await prisma.medicalHistory.create({
      data: {
        ...req.body,
        userId: req.user.id,
        diagnosisDate: new Date(req.body.diagnosisDate)
      }
    });
    res.json(record);
  } catch (error) {
    console.error('Create medical history error:', error);
    res.status(500).json({ error: 'Failed to create medical history' });
  }
});

// Update medical history record
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.medicalHistory.updateMany({
      where: { id: parseInt(req.params.id), userId: req.user.id },
      data: {
        ...req.body,
        diagnosisDate: req.body.diagnosisDate ? new Date(req.body.diagnosisDate) : undefined
      }
    });
    const updated = await prisma.medicalHistory.findFirst({
      where: { id: parseInt(req.params.id) }
    });
    res.json(updated);
  } catch (error) {
    console.error('Update medical history error:', error);
    res.status(500).json({ error: 'Failed to update medical history' });
  }
});

// Delete medical history record
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.medicalHistory.deleteMany({
      where: { id: parseInt(req.params.id), userId: req.user.id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete medical history error:', error);
    res.status(500).json({ error: 'Failed to delete medical history' });
  }
});

// AI Medical History Analysis
router.post('/:id/analyze', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const record = await prisma.medicalHistory.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.id }
    });

    if (!record) {
      return res.status(404).json({ error: 'Medical history record not found' });
    }

    // Get all user's medical history for comprehensive analysis
    const allHistory = await prisma.medicalHistory.findMany({
      where: { userId: req.user.id }
    });

    const historyList = allHistory.map(h =>
      `- ${h.condition} (${h.status}): Diagnosed ${new Date(h.diagnosisDate).toLocaleDateString()}`
    ).join('\n');

    const userMessage = `
Current condition being analyzed: ${record.condition}
Status: ${record.status}
Diagnosis Date: ${new Date(record.diagnosisDate).toLocaleDateString()}
Treating Doctor: ${record.treatingDoctor || 'Not specified'}
Hospital: ${record.hospital || 'Not specified'}
Related Medications: ${record.medications || 'None specified'}
Surgeries: ${record.surgeries || 'None'}
Allergies: ${record.allergies || 'None known'}
Family History: ${record.familyHistory || 'Not specified'}
Notes: ${record.notes || 'None'}

Complete Medical History:
${historyList}

Please analyze this medical history and provide insights, potential risk factors, and recommendations.
`;

    const aiResponse = await callOpenRouterAI(AI_PROMPTS.medicalHistoryInsights, userMessage);

    if (aiResponse.error) {
      return res.status(500).json({ error: aiResponse.error });
    }

    const structured = parseStructuredResponse(aiResponse.content);

    // Save AI insights to record
    const updated = await prisma.medicalHistory.update({
      where: { id: record.id },
      data: { aiInsights: aiResponse.content }
    });

    const result = {
      record: updated,
      analysis: aiResponse.content,
      structured,
      rawResponse: aiResponse.content,
      model: aiResponse.model,
      usage: aiResponse.usage
    };

    setCached('medicalhistory', req.params.id, result);
    res.json(result);
  } catch (error) {
    console.error('AI Medical History Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze medical history' });
  }
});

// Analyze complete medical history
router.post('/analyze-all', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const history = await prisma.medicalHistory.findMany({
      where: { userId: req.user.id }
    });

    if (history.length === 0) {
      return res.status(400).json({ error: 'No medical history found' });
    }

    const historyDetails = history.map(h => `
Condition: ${h.condition}
Status: ${h.status}
Diagnosed: ${new Date(h.diagnosisDate).toLocaleDateString()}
Medications: ${h.medications || 'None'}
Surgeries: ${h.surgeries || 'None'}
Allergies: ${h.allergies || 'None'}
Family History: ${h.familyHistory || 'Not specified'}
`).join('\n---\n');

    const userMessage = `
Please analyze the following complete medical history and provide comprehensive insights:

${historyDetails}

Provide a holistic view of the patient's health, identify patterns, potential risk factors, and recommendations for preventive care.
`;

    const aiResponse = await callOpenRouterAI(AI_PROMPTS.medicalHistoryInsights, userMessage);

    if (aiResponse.error) {
      return res.status(500).json({ error: aiResponse.error });
    }

    const structured = parseStructuredResponse(aiResponse.content);

    res.json({
      analysis: aiResponse.content,
      structured,
      rawResponse: aiResponse.content,
      model: aiResponse.model,
      usage: aiResponse.usage
    });
  } catch (error) {
    console.error('AI Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze medical history' });
  }
});

export default router;
