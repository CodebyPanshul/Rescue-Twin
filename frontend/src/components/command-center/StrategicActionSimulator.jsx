'use client';

import { useState } from 'react';
import { getStrategicActions } from '../../services/api';
import { useFetch } from '../../hooks/useFetch';
import { DashboardCard } from '../ui/DashboardCard';
import { LoadingState } from '../ui/LoadingSpinner';

export default function StrategicActionSimulator() {
  const [scenario, setScenario] = useState('flood_high');
  const { data, loading, error } = useFetch(
    () => getStrategicActions(scenario),
    [scenario],
  );

  return (
    <DashboardCard
      title="Strategic Action Simulator"
      icon="🧠"
      headerAction={
        <select
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          className="rounded-lg border border-slate-600 bg-slate-700/80 px-3 py-1.5 text-sm text-slate-200"
        >
          <option value="flood_high">Flood (high)</option>
          <option value="flood_medium">Flood (medium)</option>
          <option value="earthquake">Earthquake</option>
        </select>
      }
    >
      <p className="text-sm text-slate-400 mb-4">
        Top 3 recommended actions with projected casualty and infrastructure damage reduction.
      </p>
      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
      {loading ? (
        <LoadingState />
      ) : data?.recommended_actions?.length ? (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">{data.scenario_summary}</p>
          {data.recommended_actions.map((action) => (
            <div key={action.action_id} className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-semibold text-slate-200">#{action.outcome_rank} {action.title}</h4>
                <span className="text-xs bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded">Rank {action.outcome_rank}</span>
              </div>
              <p className="text-sm text-slate-400 mb-3">{action.description}</p>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                  <div className="font-bold text-emerald-400">{action.casualty_reduction_pct}%</div>
                  <div className="text-xs text-slate-500">Casualty reduction</div>
                </div>
                <div>
                  <div className="font-bold text-amber-400">{action.infrastructure_damage_reduction_pct}%</div>
                  <div className="text-xs text-slate-500">Damage reduction</div>
                </div>
                <div>
                  <div className="font-bold text-sky-400">{action.time_to_impact_minutes} min</div>
                  <div className="text-xs text-slate-500">Time to impact</div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">{action.branch_summary}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500 text-sm">No actions available.</p>
      )}
    </DashboardCard>
  );
}
