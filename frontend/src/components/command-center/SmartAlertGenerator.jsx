'use client';

import { useState } from 'react';
import { generateAlert } from '../../services/api';
import { DashboardCard } from '../ui/DashboardCard';

export default function SmartAlertGenerator() {
  const [severity, setSeverity] = useState('high');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await generateAlert(severity);
      setResult(data);
    } catch (e) {
      setError(e?.message || 'Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardCard title="Smart Alert Generator" icon="📢">
      <p className="text-sm text-slate-400 mb-4">
        Generate dynamic evacuation messages in English, Hindi, and a regional language. Messages adapt to risk severity.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        <label className="text-sm text-slate-400">Risk severity:</label>
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="rounded-lg border border-slate-600 bg-slate-700/80 px-3 py-1.5 text-sm text-slate-200"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-medium"
        >
          {loading ? 'Generating…' : 'Generate alerts'}
        </button>
      </div>
      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
      {result && (
        <div className="space-y-4 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">English</h4>
            <p className="text-sm text-slate-200">{result.english}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Hindi</h4>
            <p className="text-sm text-slate-200">{result.hindi}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Regional (simulated)</h4>
            <p className="text-sm text-slate-200">{result.regional}</p>
          </div>
        </div>
      )}
    </DashboardCard>
  );
}
