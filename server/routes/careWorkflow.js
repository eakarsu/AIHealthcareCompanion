import express from 'express';
import prisma from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateCareRequest, buildCareSupportDraft } from '../domain/careSupportWorkflow.js';

const router = express.Router();
router.use(authenticateToken);
const tenantOf = (req) => req.user.tenantKey || `patient-${req.user.id}`;

router.post('/episodes', async (req, res) => {
  const errors = validateCareRequest(req.body);
  if (errors.length) return res.status(400).json({ error: 'validation_failed', details: errors });
  const tenantKey = tenantOf(req);
  const prior = await prisma.careEpisode.findUnique({ where: { tenantKey_clientEventId: { tenantKey, clientEventId: req.body.client_event_id } } });
  if (prior) return res.json({ episode: prior, idempotent_replay: true });
  const draft = buildCareSupportDraft(req.body);
  try {
    const episode = await prisma.$transaction(async (tx) => {
      const created = await tx.careEpisode.create({ data: {
        tenantKey, patientId: req.user.id, clientEventId: req.body.client_event_id,
        status: draft.status, rulesetVersion: draft.ruleset_version,
        consent: req.body.consent, symptoms: req.body.symptoms, goals: req.body.goals, triage: draft,
      } });
      for (const source of req.body.sources) await tx.careEvidenceSnapshot.create({ data: {
        episodeId: created.id, sourceTitle: source.title, sourceUri: source.uri, sourceSha256: source.sha256,
        publishedAt: source.published_at ? new Date(source.published_at) : null, retrievedAt: new Date(source.retrieved_at),
      } });
      for (const action of draft.actions) await tx.careProposedAction.create({ data: { episodeId: created.id, type: action.type, status: 'proposed', payload: action } });
      await tx.careWorkflowAudit.create({ data: { tenantKey, episodeId: created.id, actorId: req.user.id, action: 'episode_created', details: { status: draft.status } } });
      return created;
    });
    res.status(201).json({ episode, draft, warning: 'No reminder, caregiver, clinician, pharmacy, device, or emergency service was contacted.' });
  } catch (error) {
    console.error('care episode failed:', error);
    res.status(500).json({ error: 'care_workflow_failed' });
  }
});

router.post('/episodes/:id/user-review', async (req, res) => {
  const decision = req.body?.decision;
  if (!['confirm', 'reject'].includes(decision)) return res.status(400).json({ error: 'decision must be confirm or reject' });
  const tenantKey = tenantOf(req);
  const episode = await prisma.careEpisode.findFirst({ where: { id: Number(req.params.id), tenantKey, patientId: req.user.id, status: 'user_review_required' } });
  if (!episode) return res.status(404).json({ error: 'reviewable_episode_not_found' });
  const status = decision === 'confirm' ? 'user_confirmed' : 'rejected';
  const updated = await prisma.$transaction(async (tx) => {
    const item = await tx.careEpisode.update({ where: { id: episode.id }, data: { status, reviewedBy: req.user.id, reviewedAt: new Date() } });
    await tx.careReview.create({ data: { episodeId: episode.id, reviewerId: req.user.id, reviewerRole: req.user.role, decision, notes: req.body.notes || null } });
    await tx.careWorkflowAudit.create({ data: { tenantKey, episodeId: episode.id, actorId: req.user.id, action: `user_${status}`, details: { notes: req.body.notes || null } } });
    return item;
  });
  res.json({ episode: updated, warning: 'Confirmation does not send or execute any proposed action.' });
});

router.post('/episodes/:id/clinician-review', async (req, res) => {
  if (!['clinician', 'admin'].includes(req.user.role)) return res.status(403).json({ error: 'clinician_or_admin_role_required' });
  const decision = req.body?.decision;
  if (!['approve_support_plan', 'reject', 'request_follow_up'].includes(decision)) return res.status(400).json({ error: 'invalid clinician review decision' });
  const tenantKey = tenantOf(req);
  const episode = await prisma.careEpisode.findFirst({ where: { id: Number(req.params.id), tenantKey, status: 'clinician_review_required', patientId: { not: req.user.id } } });
  if (!episode) return res.status(409).json({ error: 'episode_not_reviewable_or_role_separation_failed' });
  const status = decision === 'approve_support_plan' ? 'clinician_approved' : decision === 'reject' ? 'rejected' : 'follow_up_requested';
  const updated = await prisma.$transaction(async (tx) => {
    const item = await tx.careEpisode.update({ where: { id: episode.id }, data: { status, reviewedBy: req.user.id, reviewedAt: new Date() } });
    await tx.careReview.create({ data: { episodeId: episode.id, reviewerId: req.user.id, reviewerRole: req.user.role, decision, notes: req.body.notes || null } });
    await tx.careWorkflowAudit.create({ data: { tenantKey, episodeId: episode.id, actorId: req.user.id, action: `clinician_${status}`, details: { notes: req.body.notes || null } } });
    return item;
  });
  res.json({ episode: updated, warning: 'Review is recorded locally; no clinical order, message, or treatment was executed.' });
});

export default router;
