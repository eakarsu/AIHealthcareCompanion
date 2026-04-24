import express from 'express';
import prisma from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { callOpenRouterAI, AI_PROMPTS } from '../services/openRouterAI.js';

const router = express.Router();

// Get all vision tests for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const tests = await prisma.visionTest.findMany({
      where: { userId: req.user.id },
      orderBy: { testDate: 'desc' }
    });
    res.json(tests);
  } catch (error) {
    console.error('Get vision tests error:', error);
    res.status(500).json({ error: 'Failed to fetch vision tests' });
  }
});

// Get single vision test
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const test = await prisma.visionTest.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.id }
    });
    if (!test) {
      return res.status(404).json({ error: 'Vision test not found' });
    }
    res.json(test);
  } catch (error) {
    console.error('Get vision test error:', error);
    res.status(500).json({ error: 'Failed to fetch vision test' });
  }
});

// Create vision test
router.post('/', authenticateToken, async (req, res) => {
  try {
    const test = await prisma.visionTest.create({
      data: {
        ...req.body,
        userId: req.user.id,
        testDate: req.body.testDate ? new Date(req.body.testDate) : new Date()
      }
    });
    res.json(test);
  } catch (error) {
    console.error('Create vision test error:', error);
    res.status(500).json({ error: 'Failed to create vision test' });
  }
});

// Update vision test
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.visionTest.updateMany({
      where: { id: parseInt(req.params.id), userId: req.user.id },
      data: {
        ...req.body,
        testDate: req.body.testDate ? new Date(req.body.testDate) : undefined
      }
    });
    const updated = await prisma.visionTest.findFirst({
      where: { id: parseInt(req.params.id) }
    });
    res.json(updated);
  } catch (error) {
    console.error('Update vision test error:', error);
    res.status(500).json({ error: 'Failed to update vision test' });
  }
});

// Delete vision test
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.visionTest.deleteMany({
      where: { id: parseInt(req.params.id), userId: req.user.id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete vision test error:', error);
    res.status(500).json({ error: 'Failed to delete vision test' });
  }
});

// AI Vision Analysis
router.post('/:id/analyze', authenticateToken, async (req, res) => {
  try {
    const test = await prisma.visionTest.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.id }
    });

    if (!test) {
      return res.status(404).json({ error: 'Vision test not found' });
    }

    const userMessage = `
Test Type: ${test.testType}
Left Eye Result: ${test.leftEyeResult || 'Not tested'}
Right Eye Result: ${test.rightEyeResult || 'Not tested'}
Color Vision: ${test.colorVision || 'Not tested'}
Contrast Sensitivity: ${test.contrastSensitivity || 'Not tested'}
Near Vision: ${test.nearVision || 'Not tested'}
Distance Vision: ${test.distanceVision || 'Not tested'}

Please analyze these vision test results and provide recommendations. Remember to advise consulting an eye care professional for comprehensive examination.
`;

    const aiResponse = await callOpenRouterAI(AI_PROMPTS.visionAnalysis, userMessage);

    if (aiResponse.error) {
      return res.status(500).json({ error: aiResponse.error });
    }

    // Save AI analysis to test
    const updated = await prisma.visionTest.update({
      where: { id: test.id },
      data: { aiAnalysis: aiResponse.content }
    });

    res.json({
      record: updated,
      analysis: aiResponse.content,
      model: aiResponse.model,
      usage: aiResponse.usage
    });
  } catch (error) {
    console.error('AI Vision Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze vision test' });
  }
});

// Get visual acuity chart data
router.get('/chart/snellen', (req, res) => {
  const snellenChart = [
    { line: 1, letters: 'E', size: '20/200' },
    { line: 2, letters: 'FP', size: '20/100' },
    { line: 3, letters: 'TOZ', size: '20/70' },
    { line: 4, letters: 'LPED', size: '20/50' },
    { line: 5, letters: 'PECFD', size: '20/40' },
    { line: 6, letters: 'EDFCZP', size: '20/30' },
    { line: 7, letters: 'FELOPZD', size: '20/25' },
    { line: 8, letters: 'DEFPOTEC', size: '20/20' },
    { line: 9, letters: 'LEFODPCT', size: '20/15' },
    { line: 10, letters: 'FDPLTCEO', size: '20/10' }
  ];
  res.json(snellenChart);
});

export default router;
