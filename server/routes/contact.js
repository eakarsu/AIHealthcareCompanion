import express from 'express';
import prisma from '../db.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const contact = await prisma.contactMessage.create({
      data: { name, email, subject, message }
    });
    res.json({ success: true, message: 'Your message has been sent. We will get back to you soon.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
