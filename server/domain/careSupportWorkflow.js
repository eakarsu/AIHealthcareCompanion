export const RULESET_VERSION = 'care-support-boundaries-2026-07-18';

const EMERGENCY_PATTERNS = [
  /chest pain/i, /cannot breathe|difficulty breathing|severe shortness of breath/i,
  /face droop|one-sided weakness|slurred speech/i, /passed out|unconscious/i,
  /suicidal|self harm|harm myself/i, /severe bleeding/i,
];

export function validateCareRequest(input = {}) {
  const errors = [];
  if (!input.client_event_id || typeof input.client_event_id !== 'string') errors.push('client_event_id is required');
  if (input.consent?.care_support !== true) errors.push('explicit care_support consent is required');
  if (!Array.isArray(input.symptoms) || !input.symptoms.length || input.symptoms.some((item) => typeof item !== 'string')) errors.push('symptoms must be a non-empty string array');
  if (!Array.isArray(input.goals)) errors.push('goals must be an array');
  if (!Array.isArray(input.sources)) errors.push('sources must be an array');
  for (const source of input.sources || []) {
    if (!source.title || !source.uri || !/^[a-f0-9]{64}$/i.test(source.sha256 || '') || !source.retrieved_at) errors.push('each source requires title, uri, sha256, and retrieved_at');
  }
  return [...new Set(errors)];
}

export function buildCareSupportDraft(input) {
  const combined = input.symptoms.join(' ');
  const matchedEmergencySignals = EMERGENCY_PATTERNS.filter((pattern) => pattern.test(combined)).map((pattern) => pattern.source);
  const emergency = matchedEmergencySignals.length > 0 || Number(input.severity_0_10) >= 9;
  const clinicianReview = emergency || Number(input.severity_0_10) >= 7 || input.new_or_worsening === true;
  const actions = emergency ? [] : [
    { type: 'symptom_journal', status: 'proposed', content: 'Record changes, timing, and questions for a licensed clinician.' },
    { type: 'provider_question_list', status: 'proposed', content: 'Prepare the patient-entered symptoms, goals, and source list for review.' },
    ...(input.request_reminder ? [{ type: 'reminder', status: 'proposed', content: String(input.request_reminder).slice(0, 300) }] : []),
  ];
  return {
    ruleset_version: RULESET_VERSION,
    status: emergency ? 'emergency_boundary' : clinicianReview ? 'clinician_review_required' : 'user_review_required',
    matched_emergency_signals: matchedEmergencySignals,
    emergency_message: emergency ? 'Seek local emergency services now. Do not wait for this application. This software cannot diagnose or manage emergencies.' : null,
    actions,
    citations: input.sources.map((source) => ({ title: source.title, uri: source.uri, sha256: source.sha256, retrieved_at: source.retrieved_at })),
    uncertainty: 'No diagnosis or treatment recommendation was generated. Patient-entered context may be incomplete or inaccurate.',
    clinician_review_required: clinicianReview,
    execution: { reminder_sent: false, caregiver_notified: false, clinician_contacted: false, medication_changed: false },
  };
}
