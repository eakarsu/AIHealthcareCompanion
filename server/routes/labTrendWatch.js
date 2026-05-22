import express from 'express';

const router = express.Router();

router.get('/', (_req, res) => {
  res.json({
    feature: 'Lab Trend Watch',
    summary: { panelsTracked: 18, worseningTrends: 4, medicationFlags: 3, followUpsDue: 6 },
    trends: [
      { panel: 'A1C', direction: 'rising', latest: '8.2%', concern: 'Diabetes control worsening', action: 'Prompt coaching plan and PCP follow-up' },
      { panel: 'eGFR', direction: 'declining', latest: '48', concern: 'Renal function decline', action: 'Review metformin and NSAID exposure' },
      { panel: 'LDL', direction: 'above goal', latest: '142 mg/dL', concern: 'Cardiovascular risk', action: 'Suggest statin adherence discussion' }
    ],
    reminders: [
      { patient: 'Self profile', item: 'Repeat metabolic panel', due: '2026-06-03' },
      { patient: 'Self profile', item: 'A1C recheck', due: '2026-06-18' }
    ]
  });
});

export default router;
