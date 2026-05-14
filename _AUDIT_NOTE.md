# Audit Apply Notes — AIHealthcareCompanion

## Source
`/Users/erolakarsu/projects/_AUDIT/reports/batch_04.md` section 18.

## Audit vs. Reality
The audit reported "0 AI endpoints" but the project already has comprehensive AI integration via `services/openRouterAI.js` (text + vision) used in 5 domain routes:

- Medications: `POST /api/medications/:id/analyze`, `POST /api/medications/analyze-all` (medication-interaction-checker equivalent)
- Physical therapy: `POST /api/physical-therapy/:id/analyze-form`
- Skin scans: `POST /api/skin-scans/:id/analyze` (skin-lesion-analyzer equivalent, vision-capable)
- Vision tests: `POST /api/vision-tests/:id/analyze` (vision-test-interpreter equivalent)
- Medical history: `POST /api/medical-history/:id/analyze`, `POST /api/medical-history/analyze-all`
- Each domain also has `GET /:id/analysis/cached` plus an `analysisCache.js` service.

Therefore most "missing" AI endpoints in the audit are already implemented. Remaining genuinely missing items:

- `/symptom-analyzer` — open-ended symptom intake → severity & recommended action.
- `/medication-reminder-optimizer` — adherence-pattern-driven reminder timing.
- Therapy progression-over-time (separate from per-session form analysis).

## Implemented (this pass)
None — the most useful mechanical items would need:
- A symptoms entity / data model (no `symptoms` table seen).
- An adherence event log (no medication_adherence/missed_dose data model).
- A PT progression series store.

These need product-decision and data-model design before adding AI routes; introducing them mechanically would create dead endpoints that operate on absent tables and make debugging harder.

Therefore: backlog-only for this pass. The project is in better shape than the audit indicated; remaining gaps are PRODUCT-DECISION, not mechanical.

## Backlog (Prioritized)
1. Add a `symptoms` table + `POST /api/symptoms/analyze` route (call `callOpenRouterAI` with a symptom-triage prompt).
2. Add `medication_adherence` event log + a `POST /api/medications/:id/optimize-reminders` route to suggest reminder times from adherence history.
3. Add a PT progression analyzer that aggregates session data over time (`GET /api/physical-therapy/progress`).
4. Provider integration / appointment / pharmacy / telemedicine integrations (NEEDS-CREDS).
5. Wearable data ingestion + multimodal monitoring (NEEDS-PRODUCT-DECISION + integrations).
6. Custom: agentic health assistant, personalized coaching, preventive health roadmap.

## Categorization
- MECHANICAL but blocked: symptom-analyzer & reminder-optimizer (need new tables first).
- NEEDS-PRODUCT-DECISION: progression analyzer scoring, adherence event schema.
- NEEDS-CREDS: provider, pharmacy, telemedicine integrations.

## Apply pass 3 (frontend)

- **Status:** LEFT-AS-IS.
- Verified `client/src/pages/Medications.jsx`, `SkinScans.jsx`, `PhysicalTherapy.jsx`, `VisionTests.jsx`, `MedicalHistory.jsx` all call their respective `POST /api/<domain>/:id/analyze[-form]` endpoints.
- Bearer JWT auth wired via `client/src/services/api.js` (with refresh-token rotation). 401 redirect, 429 rate-limit handling, error surfaces present.
- No files changed. Idempotence rule satisfied.
- Log: `/Users/erolakarsu/projects/_AUDIT/apply3_logs/ab3_61.md`.
