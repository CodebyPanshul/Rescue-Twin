'use client';

import { getResilienceScore } from '../../services/api';
import { useFetch } from '../../hooks/useFetch';
import { DashboardCard } from '../ui/DashboardCard';
import { LoadingState } from '../ui/LoadingSpinner';

const DEFAULT_PARAMS = {
  population_density: 0.5,
  infrastructure_strength: 0.6,
  hospital_capacity: 0.5,
  disaster_intensity: 0.5,
  historical_vulnerability: 0.4,
};

export default function ResilienceScoreWidget() {
  const { data, loading, error, refetch } = useFetch(
    () => getResilienceScore(DEFAULT_PARAMS),
    [],
  );

  const score = data?.score ?? 0;
  const color = score >= 70 ? 'text-emerald-400' : score >= 45 ? 'text-amber-400' : 'text-red-400';

  return (
    <DashboardCard
      title="Live Resilience Index (0–100)"
      icon="📊"
      headerAction={
        <button
          type="button"
          onClick={() => refetch()}
          disabled={loading}
          className="text-xs text-sky-400 hover:text-sky-300 disabled:opacity-50"
        >
          Refresh
        </button>
      }
    >
      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
      {loading && !data ? (
        <LoadingState />
      ) : (
        <>
          <div className="flex items-baseline gap-2 mb-4">
            <span className={`text-4xl font-bold tabular-nums ${color}`}>{score}</span>
            <span className="text-slate-400 text-sm">/ 100</span>
            <span className="text-slate-500 text-sm ml-2">— {data?.label ?? '—'}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${score >= 70 ? 'bg-emerald-500' : score >= 45 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Based on: population density, infrastructure strength, hospital capacity, disaster intensity, historical vulnerability.
          </p>
        </>
      )}
    </DashboardCard>
  );
}
