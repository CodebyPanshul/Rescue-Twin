'use client';

import { getInfrastructureStress } from '../../services/api';
import { useFetch } from '../../hooks/useFetch';
import { DashboardCard } from '../ui/DashboardCard';
import { LoadingState } from '../ui/LoadingSpinner';

function statusColor(s) {
  return s === 'critical' ? 'text-red-400' : s === 'stressed' ? 'text-amber-400' : 'text-emerald-400';
}

export default function InfrastructureStress() {
  const { data, loading, error } = useFetch(() => getInfrastructureStress('flood_high'), []);

  return (
    <DashboardCard title="Infrastructure Stress Simulation" icon="⚡">
      <p className="text-sm text-slate-400 mb-4">
        ICU overload, power grid, water, transport. Collapse probability and time before failure if no action.
      </p>
      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
      {loading ? (
        <LoadingState />
      ) : data?.systems?.length ? (
        <>
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 mb-4">
            <div className="text-2xl font-bold text-red-400">{data.overall_collapse_risk_pct}%</div>
            <div className="text-xs text-slate-400">Overall system collapse risk</div>
          </div>
          <ul className="space-y-3">
            {data.systems.map((sys) => (
              <li key={sys.system_name} className="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-slate-200">{sys.system_name}</span>
                  <span className={`text-sm font-medium ${statusColor(sys.status)}`}>{sys.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <span>Stress: {sys.stress_pct}%</span>
                  <span>Collapse prob: {sys.collapse_probability_pct}%</span>
                  {sys.time_before_failure_minutes != null && (
                    <span className="col-span-2">Time before failure: ~{sys.time_before_failure_minutes} min</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-slate-500 text-sm">No data available.</p>
      )}
    </DashboardCard>
  );
}
