# Apply Pass 5 — AIHealthcareCompanion

**Date:** 2026-05-08
**Stack:** Node ESM + Express + React (Vite). Postgres via Prisma. JWT bearer (`authenticateToken`). `aiRateLimiter`. `callOpenRouterAI` returns `{content, error, model, usage}`.
**Source audit:** `/Users/erolakarsu/projects/_AUDIT/reports/batch_04.md` section 18.

## Verified present
- 5 audit-recommended AI counterparts already in `routes/{medications, physicalTherapy, skinScans, visionTests, medicalHistory}.js` from prior passes (medication interaction, PT form, skin lesion, vision test, medical history).
- `services/openRouterAI.js` + `analysisCache.js`.

## Implemented this pass (3 advisory AI endpoints)
Earlier passes deferred these as "needs new tables." Pass 5 reframes them as ADVISORY endpoints that operate on EXISTING Prisma models without schema changes:

1. `POST /api/pass5/symptom-analyzer` — symptom triage from free-text input. Returns severity_level / red_flags / when_to_seek_care. No new table; not persisted.
2. `POST /api/pass5/medication-adherence-advisor` — adherence schedule based on existing `Medication.frequency/timeOfDay/startDate/endDate` fields.
3. `POST /api/pass5/therapy-progress-summary` — aggregate analysis of existing `PhysicalTherapy` rows in a configurable window.

All three:
- `authenticateToken` + `aiRateLimiter`.
- 503-on-no-key (explicit guard at top of each handler).
- Healthcare disclaimers in system prompts AND in the response payload.
- Returns parsed structured JSON when present (using existing `parseStructuredResponse`).
- New file `server/routes/pass5Tools.js`. Mounted at `/api/pass5` in `server/index.js` (additive only).

### FE
- New page `client/src/pages/AdvancedAdvisors.jsx` (3 tabs).
- Routed at `/advanced-advisors` (nested under existing `<Layout />` private route).
- Uses existing `services/api` axios client (Bearer JWT via interceptor).

## Deferred / categorization
- NEEDS-PRODUCT-DECISION + DATA-MODEL: persistent symptom log, persistent adherence event log (would require Prisma schema migration). Pass 5 explicitly avoids `prisma migrate`.
- NEEDS-CREDS: pharmacy / telemedicine / EHR provider integrations.
- TOO-RISKY mechanically: wearable ingestion, multimodal monitoring, e-prescribing.

## Smoke test
- `node --check server/routes/pass5Tools.js` PASS.
- `node --check server/index.js` PASS.
- Module-load ESM warning from `express-rate-limit` IPv6 keyGen is pre-existing and unrelated.

## Healthcare disclaimers
Every pass-5 endpoint:
- System prompt explicitly states "NOT a clinical diagnosis", "always recommend consulting a healthcare professional".
- Response payload echoes a `disclaimer` field for the FE.

## Cap respected
3 of 5 allowed. Items 4-6 (provider integration, prescription mgmt, wearables) need external creds.
