'use client';

import { useState } from 'react';
import { getEconomyImpact } from '../../services/api';
import { useFetch } from '../../hooks/useFetch';
import { DashboardCard } from '../ui/DashboardCard';
import { LoadingState } from '../ui/LoadingSpinner';

export default function EconomyImpactPredictor() {
  const [severity, setSeverity] = useState('high');
  const { data, loading, error } = useFetch(
    () => getEconomyImpact(severity),
    [severity],
  );

  return (
    <DashboardCard
      title="Disaster Economy Impact Predictor"
      icon="💰"
      headerAction={
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="rounded-lg border border-slate-600 bg-slate-700/80 px-3 py-1.5 text-sm text-slate-200"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      }
    >
      <p className="text-sm text-slate-400 mb-4">Economic loss range, infrastructure repair cost, estimated recovery time.</p>
      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
      {loading ? (
        <LoadingState />
      ) : data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg bg-slate-800/80 p-3">
              <div className="text-lg font-bold text-amber-400">{data.economic_loss_min_cr}–{data.economic_loss_max_cr} Cr</div>
              <div className="text-xs text-slate-400">Economic loss range</div>
            </div>
            <div className="rounded-lg bg-slate-800/80 p-3">
              <div className="text-lg font-bold text-sky-400">{data.infrastructure_repair_cost_cr} Cr</div>
              <div className="text-xs text-slate-400">Repair cost</div>
            </div>
            <div className="rounded-lg bg-slate-800/80 p-3 col-span-2 sm:col-span-2">
              <div className="text-lg font-bold text-emerald-400">{data.estimated_recovery_days} days</div>
              <div className="text-xs text-slate-400">Est. recovery time</div>
            </div>
          </div>
          {data.breakdown?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-2">Breakdown</h4>
              <ul className="space-y-1 text-sm text-slate-400">
                {data.breakdown.map((b, i) => (
                  <li key={i} className="flex justify-between"><span>{b.category}</span><span className="text-slate-300">{b.amount_cr} Cr</span></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="text-slate-500 text-sm">No data available.</p>
      )}
    </DashboardCard>
  );
}