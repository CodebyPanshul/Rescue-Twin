'use client';

import { useState } from 'react';
import { resourceOptimize } from '../../services/api';
import { Badge } from '../ui/Badge';
import { DashboardCard } from '../ui/DashboardCard';
import { LoadingSpinner } from '../ui/LoadingSpinner';

const INPUT_FIELDS = [
  { key: 'ambulances_available', label: 'Ambulances', min: 1, max: 50 },
  { key: 'rescue_teams', label: 'Rescue teams', min: 1, max: 20 },
  { key: 'hospital_capacity', label: 'Hospital capacity', min: 50, max: 500 },
  { key: 'population_affected', label: 'Population affected', min: 500, max: 50000, step: 500 },
];

const INITIAL_INPUTS = {
  ambulances_available: 10,
  rescue_teams: 5,
  hospital_capacity: 200,
  population_affected: 5000,
};

export default function ResourceOptimization() {
  const [inputs, setInputs] = useState(INITIAL_INPUTS);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showWhy, setShowWhy] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await resourceOptimize(inputs);
      setResult(data);
    } catch (e) {
      setError(e?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardCard
      title="AI Resource Optimization"
      icon="🚑"
      badge={<Badge variant="info">AI-Driven Allocation</Badge>}
    >
      <p className="text-sm text-slate-400 mb-4">
        Input available resources and affected population. Get ranked rescue priority zones and optimal allocation.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {INPUT_FIELDS.map(({ key, label, min, max, step = 1 }) => (
          <div key={key}>
            <label className="block text-xs text-slate-500 mb-1">{label}</label>
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={inputs[key]}
              onChange={(e) => setInputs((s) => ({ ...s, [key]: Number(e.target.value) || 0 }))}
              className="w-full rounded-lg border border-slate-600 bg-slate-700/80 px-3 py-2 text-white text-sm focus:ring-2 focus:ring-sky-500/50"
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={handleRun}
        disabled={loading}
        className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium text-sm flex items-center justify-center gap-2"
      >
        {loading ? (
          <><LoadingSpinner size="sm" /> Running…</>
        ) : (
          'Run optimization'
        )}
      </button>

      {error && <p className="text-sm text-red-400 mt-4">{error}</p>}

      {result && (
        <div className="space-y-4 pt-4 mt-4 border-t border-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg bg-slate-800/80 p-3">
              <div className="text-lg font-bold text-emerald-400">{result.estimated_response_time_reduction_pct}%</div>
              <div className="text-xs text-slate-400">Est. response-time reduction</div>
            </div>
            <div className="rounded-lg bg-slate-800/80 p-3">
              <div className="text-sm text-slate-300">Hospital suggestion</div>
              <div className="text-xs text-slate-400 mt-1 line-clamp-2">{result.hospital_load_balancing_suggestion}</div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-2">Ranked rescue priority zones</h4>
            <ul className="space-y-2">
              {(result.ranked_zones || []).slice(0, 5).map((z) => (
                <li key={z.zone_id} className="flex items-center justify-between text-sm rounded-lg bg-slate-700/50 px-3 py-2">
                  <span className="font-medium text-slate-200">#{z.priority_rank} {z.zone_name}</span>
                  <span className="text-slate-400">Ambulances: {z.recommended_ambulances} · Teams: {z.recommended_teams}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <button
              type="button"
              onClick={() => setShowWhy(!showWhy)}
              className="text-sm text-sky-400 hover:text-sky-300 font-medium"
            >
              {showWhy ? 'Hide' : 'Why this decision?'}
            </button>
            {showWhy && result.why_this_decision && (
              <div className="mt-2 rounded-lg border border-sky-500/30 bg-sky-900/20 p-3 text-sm text-slate-300 space-y-2">
                <p>{result.why_this_decision.explanation}</p>
                <p className="text-xs text-slate-400">
                  Weights: {Object.entries(result.why_this_decision.weights || {}).map(([k, v]) => `${k}: ${v}`).join(', ')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardCard>
  );
}
