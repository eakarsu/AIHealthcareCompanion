import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { callOpenRouterAI, callOpenRouterVision, parseStructuredResponse, AI_PROMPTS } from '../services/openRouterAI.js';
import { getCached, setCached } from '../services/analysisCache.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get all skin scans for user (with pagination)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [scans, total] = await Promise.all([
      prisma.skinScan.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.skinScan.count({ where: { userId: req.user.id } })
    ]);

    res.json({
      data: scans,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
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

// Get cached analysis result
router.get('/:id/analysis/cached', authenticateToken, async (req, res) => {
  const cached = getCached('skinscan', req.params.id);
  if (cached) {
    return res.json({ cached: true, ...cached });
  }
  res.json({ cached: false });
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

// AI Skin Analysis (vision-enabled)
router.post('/:id/analyze', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const scan = await prisma.skinScan.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.id }
    });

    if (!scan) {
      return res.status(404).json({ error: 'Skin scan not found' });
    }

    let aiResponse;
    let usedVision = false;

    // If an image file was uploaded, use vision analysis
    if (scan.imageUrl) {
      // imageUrl stores relative path like /uploads/filename or a URL
      // Try to read from disk (multer stores in uploads/ at project root)
      const imagePath = scan.imageUrl.startsWith('/')
        ? path.join(__dirname, '../../', scan.imageUrl)
        : path.join(__dirname, '../../uploads/', path.basename(scan.imageUrl));

      if (fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Data = imageBuffer.toString('base64');
        const ext = path.extname(imagePath).toLowerCase();
        const mediaTypeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' };
        const mediaType = mediaTypeMap[ext] || 'image/jpeg';

        const visionPrompt = `Analyze this skin image. Return JSON only (no markdown): { "lesion_type": string, "abcde_score": { "asymmetry": 1-5, "border": 1-5, "color": 1-5, "diameter_estimate": string, "evolution_unknown": boolean }, "urgency_tier": "routine|urgent|emergency", "risk_level": "low|moderate|high", "recommendations": [string], "disclaimer": string }

Additional context from patient:
Body Location: ${scan.bodyLocation}
Symptom Description: ${scan.symptomDescription}
Duration: ${scan.duration}
Self-reported Severity: ${scan.severity}`;

        aiResponse = await callOpenRouterVision(base64Data, mediaType, visionPrompt);
        usedVision = true;
      }
    }

    // Fallback to text analysis if no image or image not found
    if (!aiResponse || aiResponse.error) {
      const userMessage = `
Body Location: ${scan.bodyLocation}
Symptom Description: ${scan.symptomDescription}
Duration: ${scan.duration}
Severity (self-reported): ${scan.severity}

Please analyze this skin condition description and provide guidance. Remember to advise consulting a dermatologist for proper diagnosis.
`;
      aiResponse = await callOpenRouterAI(AI_PROMPTS.skinAnalysis, userMessage);
    }

    if (aiResponse.error) {
      return res.status(500).json({ error: aiResponse.error });
    }

    // Parse structured JSON from response
    let structured = null;
    let riskLevel = 'low';

    if (usedVision) {
      structured = parseStructuredResponse(aiResponse.content);
      if (structured) {
        riskLevel = structured.risk_level || 'low';
      }
    }

    if (!structured) {
      // Fallback: infer risk from text
      const content = aiResponse.content.toLowerCase();
      if (content.includes('high risk') || content.includes('urgent') || content.includes('immediately') || content.includes('emergency')) {
        riskLevel = 'high';
      } else if (content.includes('moderate') || content.includes('monitor')) {
        riskLevel = 'moderate';
      }
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

    const result = {
      record: updated,
      analysis: aiResponse.content,
      structured,
      rawResponse: aiResponse.content,
      usedVision,
      riskLevel,
      model: aiResponse.model,
      usage: aiResponse.usage
    };

    setCached('skinscan', req.params.id, result);

    res.json(result);
  } catch (error) {
    console.error('AI Skin Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze skin condition' });
  }
});

export default router;
