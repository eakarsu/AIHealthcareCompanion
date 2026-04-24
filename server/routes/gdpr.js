import express from 'express';
import prisma from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/export', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [user, medications, physicalTherapy, skinScans, visionTests, medicalHistory, notifications, feedbacks] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true, role: true, emailVerified: true, darkMode: true, language: true, createdAt: true, updatedAt: true } }),
      prisma.medication.findMany({ where: { userId } }),
      prisma.physicalTherapy.findMany({ where: { userId } }),
      prisma.skinScan.findMany({ where: { userId } }),
      prisma.visionTest.findMany({ where: { userId } }),
      prisma.medicalHistory.findMany({ where: { userId } }),
      prisma.notification.findMany({ where: { userId } }),
      prisma.feedback.findMany({ where: { userId } })
    ]);

    res.json({
      exportDate: new Date().toISOString(),
      gdprNotice: 'This export contains all personal data stored in our system for your account.',
      user,
      medications,
      physicalTherapy,
      skinScans,
      visionTests,
      medicalHistory,
      notifications,
      feedbacks
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to export data' });
  }
});

router.delete('/delete-account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    await prisma.$transaction([
      prisma.notification.deleteMany({ where: { userId } }),
      prisma.feedback.deleteMany({ where: { userId } }),
      prisma.auditLog.deleteMany({ where: { userId } }),
      prisma.medication.deleteMany({ where: { userId } }),
      prisma.physicalTherapy.deleteMany({ where: { userId } }),
      prisma.skinScan.deleteMany({ where: { userId } }),
      prisma.visionTest.deleteMany({ where: { userId } }),
      prisma.medicalHistory.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } })
    ]);

    res.json({ success: true, message: 'Your account and all associated data have been permanently deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
