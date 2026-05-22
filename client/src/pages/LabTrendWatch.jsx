import { useEffect, useState } from 'react';
import api from '../services/api';

export default function LabTrendWatch() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/lab-trend-watch')
      .then((res) => setData(res.data))
      .catch(() => setData(null));
  }, []);

  if (!data) return <div className="text-gray-700">Loading lab trend watch...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lab Trend Watch</h1>
        <p className="text-gray-600">Track lab drift, medication flags, and follow-up reminders from imported results.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(data.summary).map(([key, value]) => (
          <div key={key} className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-blue-700">{value}</div>
            <div className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Trend Flags</h2>
          {data.trends.map((trend) => (
            <div key={trend.panel} className="border-t border-gray-100 py-3">
              <div className="font-semibold">{trend.panel} - {trend.direction}</div>
              <div className="text-sm text-gray-600">{trend.latest} - {trend.concern}</div>
              <div className="text-sm text-blue-700">{trend.action}</div>
            </div>
          ))}
        </section>
        <section className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Follow-ups</h2>
          {data.reminders.map((item) => (
            <div key={`${item.item}-${item.due}`} className="border-t border-gray-100 py-3">
              <div className="font-semibold">{item.item}</div>
              <div className="text-sm text-gray-600">{item.patient} - due {item.due}</div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
