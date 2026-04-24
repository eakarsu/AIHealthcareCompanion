import express from 'express';
import prisma from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/csv/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const userId = req.user.id;
    let data, headers, filename;

    switch (type) {
      case 'medications': {
        data = await prisma.medication.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
        headers = ['Name', 'Dosage', 'Frequency', 'Time of Day', 'Purpose', 'Side Effects', 'Active', 'Start Date', 'Notes'];
        filename = 'medications.csv';
        data = data.map(m => [m.name, m.dosage, m.frequency, m.timeOfDay, m.purpose, m.sideEffects || '', m.isActive ? 'Yes' : 'No', new Date(m.startDate).toLocaleDateString(), m.notes || '']);
        break;
      }
      case 'physical-therapy': {
        data = await prisma.physicalTherapy.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
        headers = ['Exercise', 'Body Part', 'Duration (min)', 'Reps', 'Sets', 'Difficulty', 'Status', 'Instructions'];
        filename = 'physical-therapy.csv';
        data = data.map(e => [e.exerciseName, e.bodyPart, e.duration, e.repetitions, e.sets, e.difficulty, e.status, e.instructions]);
        break;
      }
      case 'skin-scans': {
        data = await prisma.skinScan.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
        headers = ['Body Location', 'Symptoms', 'Duration', 'Severity', 'Risk Level', 'Follow-up Needed', 'Date'];
        filename = 'skin-scans.csv';
        data = data.map(s => [s.bodyLocation, s.symptomDescription, s.duration, s.severity, s.riskLevel || 'N/A', s.followUpNeeded ? 'Yes' : 'No', new Date(s.createdAt).toLocaleDateString()]);
        break;
      }
      case 'vision-tests': {
        data = await prisma.visionTest.findMany({ where: { userId }, orderBy: { testDate: 'desc' } });
        headers = ['Test Type', 'Left Eye', 'Right Eye', 'Color Vision', 'Near Vision', 'Distance Vision', 'Date'];
        filename = 'vision-tests.csv';
        data = data.map(t => [t.testType, t.leftEyeResult || 'N/A', t.rightEyeResult || 'N/A', t.colorVision || 'N/A', t.nearVision || 'N/A', t.distanceVision || 'N/A', new Date(t.testDate).toLocaleDateString()]);
        break;
      }
      case 'medical-history': {
        data = await prisma.medicalHistory.findMany({ where: { userId }, orderBy: { diagnosisDate: 'desc' } });
        headers = ['Condition', 'Status', 'Doctor', 'Hospital', 'Diagnosis Date', 'Medications', 'Allergies', 'Notes'];
        filename = 'medical-history.csv';
        data = data.map(h => [h.condition, h.status, h.treatingDoctor || '', h.hospital || '', new Date(h.diagnosisDate).toLocaleDateString(), h.medications || '', h.allergies || '', h.notes || '']);
        break;
      }
      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }

    const escapeCsv = (val) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const csv = [headers.join(','), ...data.map(row => row.map(escapeCsv).join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

router.get('/json/all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [user, medications, physicalTherapy, skinScans, visionTests, medicalHistory] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true, createdAt: true } }),
      prisma.medication.findMany({ where: { userId } }),
      prisma.physicalTherapy.findMany({ where: { userId } }),
      prisma.skinScan.findMany({ where: { userId } }),
      prisma.visionTest.findMany({ where: { userId } }),
      prisma.medicalHistory.findMany({ where: { userId } })
    ]);

    const exportData = { exportDate: new Date().toISOString(), user, medications, physicalTherapy, skinScans, visionTests, medicalHistory };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="health-data-export.json"');
    res.json(exportData);
  } catch (error) {
    res.status(500).json({ error: 'Export failed' });
  }
});

export default router;
