import express from 'express';
import prisma from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { callOpenRouterAI, AI_PROMPTS } from '../services/openRouterAI.js';

const router = express.Router();

// Get all skin scans for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const scans = await prisma.skinScan.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(scans);
  } catch (error) {
    console.error('Get skin scans error:', error);
    res.status(500).json({ error: 'Failed to fetch skin scans' });
  }
});

// Get single skin scan
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const scan = await prisma.skinScan.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.id }
    });
    if (!scan) {
      return res.status(404).json({ error: 'Skin scan not found' });
    }
    res.json(scan);
  } catch (error) {
    console.error('Get skin scan error:', error);
    res.status(500).json({ error: 'Failed to fetch skin scan' });
  }
});

// Create skin scan
router.post('/', authenticateToken, async (req, res) => {
  try {
    const scan = await prisma.skinScan.create({
      data: {
        ...req.body,
        userId: req.user.id
      }
    });
    res.json(scan);
  } catch (error) {
    console.error('Create skin scan error:', error);
    res.status(500).json({ error: 'Failed to create skin scan' });
  }
});

// Update skin scan
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.skinScan.updateMany({
      where: { id: parseInt(req.params.id), userId: req.user.id },
      data: req.body
    });
    const updated = await prisma.skinScan.findFirst({
      where: { id: parseInt(req.params.id) }
    });
    res.json(updated);
  } catch (error) {
    console.error('Update skin scan error:', error);
    res.status(500).json({ error: 'Failed to update skin scan' });
  }
});

// Delete skin scan
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.skinScan.deleteMany({
      where: { id: parseInt(req.params.id), userId: req.user.id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete skin scan error:', error);
    res.status(500).json({ error: 'Failed to delete skin scan' });
  }
});

// AI Skin Analysis
router.post('/:id/analyze', authenticateToken, async (req, res) => {
  try {
    const scan = await prisma.skinScan.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.id }
    });

    if (!scan) {
      return res.status(404).json({ error: 'Skin scan not found' });
    }

    const userMessage = `
Body Location: ${scan.bodyLocation}
Symptom Description: ${scan.symptomDescription}
Duration: ${scan.duration}
Severity (self-reported): ${scan.severity}

Please analyze this skin condition description and provide guidance. Remember to advise consulting a dermatologist for proper diagnosis.
`;

    const aiResponse = await callOpenRouterAI(AI_PROMPTS.skinAnalysis, userMessage);

    if (aiResponse.error) {
      return res.status(500).json({ error: aiResponse.error });
    }

    // Parse risk level from AI response (simplified)
    let riskLevel = 'low';
    const content = aiResponse.content.toLowerCase();
    if (content.includes('high risk') || content.includes('urgent') || content.includes('immediately')) {
      riskLevel = 'high';
    } else if (content.includes('moderate') || content.includes('monitor')) {
      riskLevel = 'moderate';
    }

    // Save AI analysis to scan
    const updated = await prisma.skinScan.update({
      where: { id: scan.id },
      data: {
        aiDiagnosis: aiResponse.content,
        riskLevel: riskLevel,
        followUpNeeded: riskLevel !== 'low'
      }
    });

    res.json({
      record: updated,
      analysis: aiResponse.content,
      riskLevel: riskLevel,
      model: aiResponse.model,
      usage: aiResponse.usage
    });
  } catch (error) {
    console.error('AI Skin Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze skin condition' });
  }
});

export default router;
