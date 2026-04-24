import express from 'express';
import prisma from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { callOpenRouterAI, AI_PROMPTS } from '../services/openRouterAI.js';

const router = express.Router();

// Get all medications for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const medications = await prisma.medication.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(medications);
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
router.post('/:id/analyze', authenticateToken, async (req, res) => {
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

    const medicationList = allMedications.map(m =>
      `${m.name} (${m.dosage}, ${m.frequency})`
    ).join(', ');

    const userMessage = `
Current medication to analyze: ${medication.name}
Dosage: ${medication.dosage}
Frequency: ${medication.frequency}
Purpose: ${medication.purpose}
Current side effects reported: ${medication.sideEffects || 'None reported'}

Other medications the patient is taking: ${medicationList}

Please analyze this medication and check for potential interactions with the other medications.
`;

    const aiResponse = await callOpenRouterAI(AI_PROMPTS.medicationInteraction, userMessage);

    if (aiResponse.error) {
      return res.status(500).json({ error: aiResponse.error });
    }

    // Save AI analysis to medication
    const updated = await prisma.medication.update({
      where: { id: medication.id },
      data: { aiAnalysis: aiResponse.content }
    });

    res.json({
      record: updated,
      analysis: aiResponse.content,
      model: aiResponse.model,
      usage: aiResponse.usage
    });
  } catch (error) {
    console.error('AI Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze medication' });
  }
});

// Analyze all medications for interactions
router.post('/analyze-all', authenticateToken, async (req, res) => {
  try {
    const medications = await prisma.medication.findMany({
      where: { userId: req.user.id, isActive: true }
    });

    if (medications.length === 0) {
      return res.status(400).json({ error: 'No active medications found' });
    }

    const medicationDetails = medications.map(m =>
      `- ${m.name}: ${m.dosage}, ${m.frequency}, for ${m.purpose}`
    ).join('\n');

    const userMessage = `
Please analyze the following medication regimen for potential interactions and safety concerns:

${medicationDetails}

Provide a comprehensive analysis of potential drug interactions, timing recommendations, and safety warnings.
`;

    const aiResponse = await callOpenRouterAI(AI_PROMPTS.medicationInteraction, userMessage);

    if (aiResponse.error) {
      return res.status(500).json({ error: aiResponse.error });
    }

    res.json({
      analysis: aiResponse.content,
      model: aiResponse.model,
      usage: aiResponse.usage
    });
  } catch (error) {
    console.error('AI Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze medications' });
  }
});

export default router;
