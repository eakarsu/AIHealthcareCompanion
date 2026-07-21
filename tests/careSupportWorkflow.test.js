import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCareRequest, buildCareSupportDraft } from '../server/domain/careSupportWorkflow.js';

const base = {
  client_event_id: 'care-1', consent: { care_support: true }, symptoms: ['mild headache since this morning'],
  severity_0_10: 2, goals: ['prepare questions for clinician'], sources: [], request_reminder: 'Review journal tomorrow',
};

test('creates proposed educational support without executing care actions', () => {
  assert.deepEqual(validateCareRequest(base), []);
  const draft = buildCareSupportDraft(base);
  assert.equal(draft.status, 'user_review_required');
  assert.equal(draft.actions.every((action) => action.status === 'proposed'), true);
  assert.equal(draft.execution.medication_changed, false);
  assert.match(draft.uncertainty, /No diagnosis/);
});

test('emergency signal blocks normal planning and directs local emergency help', () => {
  const draft = buildCareSupportDraft({ ...base, symptoms: ['new chest pain and difficulty breathing'], severity_0_10: 9 });
  assert.equal(draft.status, 'emergency_boundary');
  assert.equal(draft.actions.length, 0);
  assert.match(draft.emergency_message, /emergency services/i);
  assert.equal(draft.execution.clinician_contacted, false);
});
