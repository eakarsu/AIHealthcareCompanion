// Apply pass 5 page — wraps three pass-5 advisory endpoints:
//   /api/pass5/symptom-analyzer, /api/pass5/medication-adherence-advisor,
//   /api/pass5/therapy-progress-summary.
// All explicitly disclaimed as informational, not medical advice.
import { useState } from 'react';
import api from '../services/api';

const TABS = [
  { id: 'symptom', label: 'Symptom Triage' },
  { id: 'adherence', label: 'Adherence Advisor' },
  { id: 'pt', label: 'Therapy Progress' },
];

export default function AdvancedAdvisors() {
  const [tab, setTab] = useState('symptom');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const [symptomForm, setSymptomForm] = useState({ symptoms: '', duration: '', severity: '', age: '', context: '' });
  const [adherenceForm, setAdherenceForm] = useState({ medication_id: '' });
  const [ptForm, setPtForm] = useState({ window_days: '30' });

  const submit = async (path, body) => {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await api.post(path, body);
      setResult(res.data);
    } catch (e) {
      const status = e.response?.status;
      const msg = e.response?.data?.error || e.message;
      setError(status === 503 ? `AI key not configured: ${msg}` : msg);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Advanced Advisors (Pass 5)</h1>
      <p style={{ color: '#666', fontSize: 13 }}>For informational purposes only. Not medical advice.</p>

      <div style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setResult(null); setError(null); }}
            style={{ padding: '8px 14px', background: tab === t.id ? '#1976d2' : '#eee', color: tab === t.id ? '#fff' : '#333', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #ddd' }}>
        {tab === 'symptom' && (
          <form onSubmit={e => { e.preventDefault(); submit('/pass5/symptom-analyzer', { ...symptomForm, severity: symptomForm.severity ? Number(symptomForm.severity) : undefined, age: symptomForm.age ? Number(symptomForm.age) : undefined }); }}>
            <label style={{ display: 'block', marginBottom: 8 }}>Symptoms *<textarea required rows={3} style={{ width: '100%', padding: 6 }} value={symptomForm.symptoms} onChange={e => setSymptomForm({ ...symptomForm, symptoms: e.target.value })} /></label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              <label>Duration<input style={{ width: '100%' }} value={symptomForm.duration} onChange={e => setSymptomForm({ ...symptomForm, duration: e.target.value })} /></label>
              <label>Severity 1-10<input type="number" min="1" max="10" style={{ width: '100%' }} value={symptomForm.severity} onChange={e => setSymptomForm({ ...symptomForm, severity: e.target.value })} /></label>
              <label>Age<input type="number" style={{ width: '100%' }} value={symptomForm.age} onChange={e => setSymptomForm({ ...symptomForm, age: e.target.value })} /></label>
            </div>
            <label style={{ display: 'block', marginTop: 8 }}>Context<textarea rows={2} style={{ width: '100%' }} value={symptomForm.context} onChange={e => setSymptomForm({ ...symptomForm, context: e.target.value })} /></label>
            <button type="submit" disabled={loading} style={{ marginTop: 12, padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6 }}>{loading ? 'Analyzing…' : 'Run triage'}</button>
          </form>
        )}

        {tab === 'adherence' && (
          <form onSubmit={e => { e.preventDefault(); submit('/pass5/medication-adherence-advisor', { medication_id: adherenceForm.medication_id ? Number(adherenceForm.medication_id) : undefined }); }}>
            <label style={{ display: 'block' }}>Medication ID (optional - all active if blank)<input style={{ width: 200 }} value={adherenceForm.medication_id} onChange={e => setAdherenceForm({ medication_id: e.target.value })} /></label>
            <button type="submit" disabled={loading} style={{ marginTop: 12, padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6 }}>{loading ? 'Building…' : 'Build adherence plan'}</button>
          </form>
        )}

        {tab === 'pt' && (
          <form onSubmit={e => { e.preventDefault(); submit('/pass5/therapy-progress-summary', { window_days: Number(ptForm.window_days) || 30 }); }}>
            <label style={{ display: 'block' }}>Lookback window (days)<input type="number" min="7" max="365" style={{ width: 120 }} value={ptForm.window_days} onChange={e => setPtForm({ window_days: e.target.value })} /></label>
            <button type="submit" disabled={loading} style={{ marginTop: 12, padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6 }}>{loading ? 'Summarizing…' : 'Summarize progress'}</button>
          </form>
        )}
      </div>

      {error && <div style={{ marginTop: 12, padding: 10, background: '#ffe5e5', color: '#a00', borderRadius: 6 }}>{error}</div>}
      {result && (
        <div style={{ marginTop: 16, padding: 16, background: '#fafafa', borderRadius: 8 }}>
          {result.disclaimer && <div style={{ fontSize: 12, color: '#a00', marginBottom: 8 }}>{result.disclaimer}</div>}
          <div style={{ whiteSpace: 'pre-wrap' }}>{result.content}</div>
          {result.structured && (
            <details style={{ marginTop: 12 }}>
              <summary>Structured</summary>
              <pre style={{ background: '#fff', padding: 8, borderRadius: 4, overflowX: 'auto' }}>{JSON.stringify(result.structured, null, 2)}</pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
