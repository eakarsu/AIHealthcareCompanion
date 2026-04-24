import express from 'express';
import prisma from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { q, type } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const query = q.trim();
    const userId = req.user.id;
    const results = {};

    if (!type || type === 'medications') {
      results.medications = await prisma.medication.findMany({
        where: {
          userId,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { purpose: { contains: query, mode: 'insensitive' } },
            { notes: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 10,
        orderBy: { createdAt: 'desc' }
      });
    }

    if (!type || type === 'physical-therapy') {
      results.physicalTherapy = await prisma.physicalTherapy.findMany({
        where: {
          userId,
          OR: [
            { exerciseName: { contains: query, mode: 'insensitive' } },
            { bodyPart: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 10,
        orderBy: { createdAt: 'desc' }
      });
    }

    if (!type || type === 'skin-scans') {
      results.skinScans = await prisma.skinScan.findMany({
        where: {
          userId,
          OR: [
            { bodyLocation: { contains: query, mode: 'insensitive' } },
            { symptomDescription: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 10,
        orderBy: { createdAt: 'desc' }
      });
    }

    if (!type || type === 'vision-tests') {
      results.visionTests = await prisma.visionTest.findMany({
        where: {
          userId,
          OR: [
            { testType: { contains: query, mode: 'insensitive' } },
            { distanceVision: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 10,
        orderBy: { testDate: 'desc' }
      });
    }

    if (!type || type === 'medical-history') {
      results.medicalHistory = await prisma.medicalHistory.findMany({
        where: {
          userId,
          OR: [
            { condition: { contains: query, mode: 'insensitive' } },
            { treatingDoctor: { contains: query, mode: 'insensitive' } },
            { hospital: { contains: query, mode: 'insensitive' } },
            { notes: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 10,
        orderBy: { diagnosisDate: 'desc' }
      });
    }

    const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
    res.json({ query, totalResults, results });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
