import express from 'express';
import prisma from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { callOpenRouterAI, parseStructuredResponse, AI_PROMPTS } from '../services/openRouterAI.js';
import { getCached, setCached } from '../services/analysisCache.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Get all medications for user (with pagination)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [medications, total] = await Promise.all([
      prisma.medication.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.medication.count({ where: { userId: req.user.id } })
    ]);

    res.json({
      data: medications,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get medications error:', error);
    res.status(500).json({ error: 'Failed to fetch medications' });
  }
});

// Get single medication
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const medication = await prisma.medication.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.id }
    });
    if (!medication) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    res.json(medication);
  } catch (error) {
    console.error('Get medication error:', error);
    res.status(500).json({ error: 'Failed to fetch medication' });
  }
});

// Get cached analysis result
router.get('/:id/analysis/cached', authenticateToken, async (req, res) => {
  const cached = getCached('medication', req.params.id);
  if (cached) {
    return res.json({ cached: true, ...cached });
  }
  res.json({ cached: false });
});

// Create medication
router.post('/', authenticateToken, async (req, res) => {
  try {
    const medication = await prisma.medication.create({
      data: {
        ...req.body,
        userId: req.user.id,
        startDate: new Date(req.body.startDate),
        endDate: req.body.endDate ? new Date(req.body.endDate) : null
      }
    });
    res.json(medication);
  } catch (error) {
    console.error('Create medication error:', error);
    res.status(500).json({ error: 'Failed to create medication' });
  }
});

// Update medication
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const medication = await prisma.medication.updateMany({
      where: { id: parseInt(req.params.id), userId: req.user.id },
      data: {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined
      }
    });
    const updated = await prisma.medication.findFirst({
      where: { id: parseInt(req.params.id) }
    });
    res.json(updated);
  } catch (error) {
    console.error('Update medication error:', error);
    res.status(500).json({ error: 'Failed to update medication' });
  }
});

// Delete medication
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.medication.deleteMany({
      where: { id: parseInt(req.params.id), userId: req.user.id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete medication error:', error);
    res.status(500).json({ error: 'Failed to delete medication' });
  }
});

// AI Analysis - Check drug interactions
router.post('/:id/analyze', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const medication = await prisma.medication.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.id }
    });

    if (!medication) {
      return res.status(404).json({ error: 'Medication not found' });
    }

    // Get all user's medications for interaction check
    const allMedications = await prisma.medication.findMany({
      where: { userId: req.user.id, isActive: true }
    });

    // Get patient's medical history for condition-aware analysis
    const medicalHistory = await prisma.medicalHistory.findMany({
      where: { userId: req.user.id }
    });

    const medicationList = allMedications.map(m =>
      `${m.name} (${m.dosage}, ${m.frequency})`
    ).join(', ');

    const conditionList = medicalHistory.length > 0
      ? medicalHistory.map(h => `${h.condition} (${h.status})`).join(', ')
      : 'None on file';

    const userMessage = `
Current medication to analyze: ${medication.name}
Dosage: ${medication.dosage}
Frequency: ${medication.frequency}
Purpose: ${medication.purpose}
Current side effects reported: ${medication.sideEffects || 'None reported'}

Patient conditions: ${conditionList}
Other medications the patient is taking: ${medicationList}

Please analyze this medication and check for potential interactions with the other medications, and note any contraindications for the patient's specific conditions.
`;

    const aiResponse = await callOpenRouterAI(AI_PROMPTS.medicationInteraction, userMessage);

    if (aiResponse.error) {
      return res.status(500).json({ error: aiResponse.error });
    }

    const structured = parseStructuredResponse(aiResponse.content);

    // Save AI analysis to medication
    const updated = await prisma.medication.update({
      where: { id: medication.id },
      data: { aiAnalysis: aiResponse.content }
    });

    const result = {
      record: updated,
      analysis: aiResponse.content,
      structured,
      rawResponse: aiResponse.content,
      model: aiResponse.model,
      usage: aiResponse.usage
    };

    setCached('medication', req.params.id, result);
    res.json(result);
  } catch (error) {
    console.error('AI Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze medication' });
  }
});

// Analyze all medications for interactions (with medical history context)
router.post('/analyze-all', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const medications = await prisma.medication.findMany({
      where: { userId: req.user.id, isActive: true }
    });

    if (medications.length === 0) {
      return res.status(400).json({ error: 'No active medications found' });
    }

    // Inject medical history for condition-aware analysis
    const medicalHistory = await prisma.medicalHistory.findMany({
      where: { userId: req.user.id }
    });

    const conditionList = medicalHistory.length > 0
      ? medicalHistory.map(h => `${h.condition} (${h.status})`).join(', ')
      : 'None on file';

    const medicationDetails = medications.map(m =>
      `- ${m.name}: ${m.dosage}, ${m.frequency}, for ${m.purpose}`
    ).join('\n');

    const userMessage = `
Patient conditions: ${conditionList}
Current medications: ${medicationDetails}

Analyze for interactions, contraindications for these specific conditions. Provide a comprehensive analysis of potential drug interactions, timing recommendations, and safety warnings specific to the patient's medical conditions.
`;

    const aiResponse = await callOpenRouterAI(AI_PROMPTS.medicationInteraction, userMessage);

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
    res.status(500).json({ error: 'Failed to analyze medications' });
  }
});

export default router;
