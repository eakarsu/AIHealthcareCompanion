import express from 'express';
import prisma from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { callOpenRouterAI, parseStructuredResponse, AI_PROMPTS } from '../services/openRouterAI.js';
import { getCached, setCached } from '../services/analysisCache.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Get all exercises for user (with pagination)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [exercises, total] = await Promise.all([
      prisma.physicalTherapy.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.physicalTherapy.count({ where: { userId: req.user.id } })
    ]);

    res.json({
      data: exercises,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

// Get single exercise
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const exercise = await prisma.physicalTherapy.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.id }
    });
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    res.json(exercise);
  } catch (error) {
    console.error('Get exercise error:', error);
    res.status(500).json({ error: 'Failed to fetch exercise' });
  }
});

// Get cached analysis
router.get('/:id/analysis/cached', authenticateToken, async (req, res) => {
  const cached = getCached('physicaltherapy', req.params.id);
  if (cached) return res.json({ cached: true, ...cached });
  res.json({ cached: false });
});

// Create exercise
router.post('/', authenticateToken, async (req, res) => {
  try {
    const exercise = await prisma.physicalTherapy.create({
      data: {
        ...req.body,
        userId: req.user.id,
        duration: parseInt(req.body.duration),
        repetitions: parseInt(req.body.repetitions),
        sets: parseInt(req.body.sets)
      }
    });
    res.json(exercise);
  } catch (error) {
    console.error('Create exercise error:', error);
    res.status(500).json({ error: 'Failed to create exercise' });
  }
});

// Update exercise
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.physicalTherapy.updateMany({
      where: { id: parseInt(req.params.id), userId: req.user.id },
      data: {
        ...req.body,
        duration: req.body.duration ? parseInt(req.body.duration) : undefined,
        repetitions: req.body.repetitions ? parseInt(req.body.repetitions) : undefined,
        sets: req.body.sets ? parseInt(req.body.sets) : undefined
      }
    });
    const updated = await prisma.physicalTherapy.findFirst({
      where: { id: parseInt(req.params.id) }
    });
    res.json(updated);
  } catch (error) {
    console.error('Update exercise error:', error);
    res.status(500).json({ error: 'Failed to update exercise' });
  }
});

// Delete exercise
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.physicalTherapy.deleteMany({
      where: { id: parseInt(req.params.id), userId: req.user.id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete exercise error:', error);
    res.status(500).json({ error: 'Failed to delete exercise' });
  }
});

// Mark exercise as completed
router.post('/:id/complete', authenticateToken, async (req, res) => {
  try {
    await prisma.physicalTherapy.updateMany({
      where: { id: parseInt(req.params.id), userId: req.user.id },
      data: { status: 'completed', completedAt: new Date() }
    });
    const updated = await prisma.physicalTherapy.findFirst({
      where: { id: parseInt(req.params.id) }
    });
    res.json(updated);
  } catch (error) {
    console.error('Complete exercise error:', error);
    res.status(500).json({ error: 'Failed to mark exercise as completed' });
  }
});

// AI Form Analysis
router.post('/:id/analyze-form', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const exercise = await prisma.physicalTherapy.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.id }
    });

    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    const { userDescription } = req.body;

    const userMessage = `
Exercise: ${exercise.exerciseName}
Target body part: ${exercise.bodyPart}
Exercise description: ${exercise.description}
Instructions: ${exercise.instructions}
Repetitions: ${exercise.repetitions}
Sets: ${exercise.sets}
Duration: ${exercise.duration} minutes
Difficulty: ${exercise.difficulty}
Precautions: ${exercise.precautions || 'None specified'}

${userDescription ? `User's description of how they're performing the exercise: ${userDescription}` : ''}

Please provide detailed guidance on proper form, common mistakes to avoid, and how to get the most benefit from this exercise.
`;

    const aiResponse = await callOpenRouterAI(AI_PROMPTS.physicalTherapyForm, userMessage);

    if (aiResponse.error) {
      return res.status(500).json({ error: aiResponse.error });
    }

    const structured = parseStructuredResponse(aiResponse.content);

    // Save AI feedback to exercise
    const updated = await prisma.physicalTherapy.update({
      where: { id: exercise.id },
      data: { aiFormFeedback: aiResponse.content }
    });

    const result = {
      record: updated,
      analysis: aiResponse.content,
      structured,
      rawResponse: aiResponse.content,
      model: aiResponse.model,
      usage: aiResponse.usage
    };

    setCached('physicaltherapy', req.params.id, result);
    res.json(result);
  } catch (error) {
    console.error('AI Form Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze form' });
  }
});

export default router;
