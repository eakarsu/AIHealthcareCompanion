CREATE TABLE IF NOT EXISTS "CareEpisode" (
  "id" SERIAL PRIMARY KEY,
  "tenantKey" TEXT NOT NULL,
  "patientId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
  "clientEventId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "rulesetVersion" TEXT NOT NULL,
  "consent" JSONB NOT NULL,
  "symptoms" JSONB NOT NULL,
  "goals" JSONB NOT NULL,
  "triage" JSONB NOT NULL,
  "reviewedBy" INTEGER REFERENCES "User"("id") ON DELETE RESTRICT,
  "reviewedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("tenantKey", "clientEventId")
);

CREATE TABLE IF NOT EXISTS "CareEvidenceSnapshot" (
  "id" SERIAL PRIMARY KEY,
  "episodeId" INTEGER NOT NULL REFERENCES "CareEpisode"("id") ON DELETE RESTRICT,
  "sourceTitle" TEXT NOT NULL,
  "sourceUri" TEXT NOT NULL,
  "sourceSha256" VARCHAR(64) NOT NULL,
  "publishedAt" TIMESTAMPTZ,
  "retrievedAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "CareProposedAction" (
  "id" SERIAL PRIMARY KEY,
  "episodeId" INTEGER NOT NULL REFERENCES "CareEpisode"("id") ON DELETE RESTRICT,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL CHECK("status" IN ('proposed','user_confirmed','clinician_approved','rejected','cancelled')),
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "CareReview" (
  "id" SERIAL PRIMARY KEY,
  "episodeId" INTEGER NOT NULL REFERENCES "CareEpisode"("id") ON DELETE RESTRICT,
  "reviewerId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
  "reviewerRole" TEXT NOT NULL,
  "decision" TEXT NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "CareWorkflowAudit" (
  "id" SERIAL PRIMARY KEY,
  "tenantKey" TEXT NOT NULL,
  "episodeId" INTEGER REFERENCES "CareEpisode"("id") ON DELETE RESTRICT,
  "actorId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
  "action" TEXT NOT NULL,
  "details" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "CareEpisode_tenant_patient_status_idx" ON "CareEpisode"("tenantKey","patientId","status");
CREATE INDEX IF NOT EXISTS "CareEvidenceSnapshot_episode_idx" ON "CareEvidenceSnapshot"("episodeId");
CREATE INDEX IF NOT EXISTS "CareProposedAction_episode_status_idx" ON "CareProposedAction"("episodeId","status");
CREATE INDEX IF NOT EXISTS "CareWorkflowAudit_tenant_episode_idx" ON "CareWorkflowAudit"("tenantKey","episodeId","createdAt");
