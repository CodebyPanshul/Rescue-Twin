'use client';

import { DashboardCard } from '../ui/DashboardCard';

/**
 * For any risk or recommendation: Why is this marked critical? Key factors, risk %, transparency.
 */
export function ExplainabilityPanel({ title = 'Why is this marked critical?', factors = [], riskPercentages = {}, concise = true }) {
  return (
    <DashboardCard
      title={title}
      badge={<span className="text-xs text-slate-500">Transparency</span>}
      className="border-sky-500/20"
    >
      <ul className="space-y-2 text-sm text-slate-300">
        {factors.map((f, i) => (
          <li key={i} className="flex items-center justify-between gap-2">
            <span>{typeof f === 'string' ? f : f.label}</span>
            {riskPercentages[f.key || f] != null && (
              <span className="text-amber-400 font-medium tabular-nums">{riskPercentages[f.key || f]}%</span>
            )}
          </li>
        ))}
      </ul>
      {concise && (
        <p className="text-xs text-slate-500 mt-3">Key contributing factors and risk percentages. AI recommendations are weighted and explainable.</p>
      )}
    </DashboardCard>
  );
}
