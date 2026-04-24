import express from 'express';
import prisma from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feedbacks' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { type, subject, message } = req.body;
    if (!type || !subject || !message) {
      return res.status(400).json({ error: 'Type, subject, and message are required' });
    }
    const feedback = await prisma.feedback.create({
      data: { userId: req.user.id, type, subject, message }
    });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const feedback = await prisma.feedback.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.id }
    });
    if (!feedback) return res.status(404).json({ error: 'Feedback not found' });
    await prisma.feedback.delete({ where: { id: feedback.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});

export default router;
