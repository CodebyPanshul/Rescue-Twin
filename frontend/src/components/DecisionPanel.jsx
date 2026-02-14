'use client';

import { useState, useCallback } from 'react';
import { Panel } from './ui/Panel';
import { Badge } from './ui/Badge';
import { MetricCard } from './ui/MetricCard';

function buildReportText(simulationData) {
  if (!simulationData) return '';
  const { risk_metrics, emergency_resources, ai_explanation, shelters } = simulationData;
  const lines = [
    '--- Rescue Twin Simulation Report ---',
    `Generated: ${new Date().toISOString()}`,
    '',
  ];
  if (simulationData.disaster_type === 'earthquake') {
    lines.push(`Disaster: Earthquake | Magnitude ${simulationData.magnitude} | Epicenter: ${simulationData.epicenter_district_name || simulationData.epicenter_district_id}`);
  } else {
    lines.push(`Disaster: Flood | Severity: ${simulationData.severity} | Rainfall: ${simulationData.rainfall_intensity ?? 'default'} mm/hr`);
  }
  lines.push('');
  lines.push('Risk metrics:');
  lines.push(`  Overall risk score: ${((risk_metrics?.overall_risk_score ?? 0) * 100).toFixed(0)}%`);
  lines.push(`  Population at risk: ${(risk_metrics?.total_population_at_risk ?? 0).toLocaleString()}`);
  lines.push(`  High/Medium/Low zones: ${risk_metrics?.high_risk_zones ?? 0} / ${risk_metrics?.medium_risk_zones ?? 0} / ${risk_metrics?.low_risk_zones ?? 0}`);
  lines.push(`  Est. evacuation time: ${risk_metrics?.estimated_evacuation_time_hours ?? 0} h`);
  lines.push('');
  lines.push('Emergency resources needed:');
  lines.push(`  Ambulances: ${emergency_resources?.ambulances_needed ?? 0} | Boats: ${emergency_resources?.rescue_boats_needed ?? 0}`);
  lines.push(`  Medical teams: ${emergency_resources?.medical_teams_needed ?? 0} | Buses: ${emergency_resources?.evacuation_buses_needed ?? 0}`);
  lines.push('');
  lines.push('AI recommendation:');
  lines.push(`  ${ai_explanation?.recommendation ?? 'N/A'}`);
  lines.push(`  Confidence: ${((ai_explanation?.confidence_score ?? 0) * 100).toFixed(0)}%`);
  if (shelters?.length) {
    lines.push('');
    lines.push(`Shelters (top 3): ${shelters.slice(0, 3).map((s) => `${s.name} (${s.capacity})`).join(', ')}`);
  }
  lines.push('');
  lines.push('--- End of report ---');
  return lines.join('\n');
}

const CHART_ICON = (
  <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

function getRiskVariant(score) {
  if (score >= 0.7) return 'critical';
  if (score >= 0.4) return 'warning';
  if (score >= 0.2) return 'advisory';
  return 'normal';
}

function getRiskLabel(score) {
  if (score >= 0.7) return 'Critical';
  if (score >= 0.4) return 'Warning';
  if (score >= 0.2) return 'Advisory';
  return 'Normal';
}

export default function DecisionPanel({
  simulationData,
  onHumanOverride,
  showOverrideConfirm,
  setShowOverrideConfirm,
}) {
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleCopyReport = useCallback(async () => {
    const text = buildReportText(simulationData);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (e) {
      console.warn('Copy failed', e);
    }
  }, [simulationData]);

  const handlePrintReport = useCallback(() => {
    const text = buildReportText(simulationData);
    if (!text) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head><title>Rescue Twin - Simulation Report</title>
      <style>body{font-family:system-ui,sans-serif;max-width:60rem;margin:2rem auto;padding:0 1rem;line-height:1.6;color:#1e293b;} h1{color:#0f172a;} pre{white-space:pre-wrap;background:#f1f5f9;padding:1rem;border-radius:8px;}</style></head>
      <body><h1>Rescue Twin – Simulation Report</h1><pre>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  }, [simulationData]);

  if (!simulationData) {
    return (
      <Panel title="Decision Intelligence" icon={CHART_ICON}>
        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
          <svg className="w-14 h-14 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm">Run a simulation to see insights</p>
        </div>
      </Panel>
    );
  }

  const { risk_metrics, emergency_resources, ai_explanation, shelters } = simulationData;
  const totalCapacity = shelters?.reduce((sum, s) => sum + s.capacity, 0) ?? 0;
  const utilization = risk_metrics?.total_population_at_risk
    ? Math.min((risk_metrics.total_population_at_risk / totalCapacity) * 100, 100)
    : 0;
  const riskScore = risk_metrics?.overall_risk_score ?? 0;

  return (
    <Panel
      title="Decision Intelligence"
      icon={CHART_ICON}
      badge={<Badge variant={getRiskVariant(riskScore)}>{getRiskLabel(riskScore)}</Badge>}
      className="flex flex-col max-h-[calc(100vh-280px)]"
    >
      <div className="space-y-4 overflow-y-auto">
        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            value={`${(riskScore * 100).toFixed(0)}%`}
            label="Overall risk"
            variant="risk"
          />
          <MetricCard
            value={(risk_metrics?.total_population_at_risk ?? 0).toLocaleString()}
            label="Population at risk"
            variant="population"
          />
          <MetricCard
            value={`${risk_metrics?.estimated_evacuation_time_hours ?? 0}h`}
            label="Est. evacuation time"
            variant="time"
          />
          <MetricCard
            value={(risk_metrics?.high_risk_zones ?? 0) + (risk_metrics?.medium_risk_zones ?? 0)}
            label="Zones affected"
            variant="zones"
          />
        </div>

        {/* Risk breakdown */}
        <div className="rounded-lg border border-slate-600/80 bg-slate-700/30 p-3">
          <h4 className="text-sm font-semibold text-slate-300 mb-2">Risk zone breakdown</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> High
              </span>
              <span className="font-medium text-red-400">{risk_metrics?.high_risk_zones ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium
              </span>
              <span className="font-medium text-amber-400">{risk_metrics?.medium_risk_zones ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Low
              </span>
              <span className="font-medium text-emerald-400">{risk_metrics?.low_risk_zones ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Shelters */}
        <div className="rounded-lg border border-slate-600/80 bg-slate-700/30 p-3">
          <h4 className="text-sm font-semibold text-slate-300 mb-2">Recommended shelters</h4>
          <div className="space-y-2">
            {shelters?.slice(0, 3).map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <span className="truncate flex-1 text-slate-300">{s.name}</span>
                <span className="text-emerald-400 ml-2 shrink-0">{s.capacity.toLocaleString()} cap</span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-600/80">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Shelter utilization</span>
              <span className={utilization > 80 ? 'text-red-400 font-medium' : 'text-emerald-400'}>
                {utilization.toFixed(0)}%
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-slate-600 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${utilization > 80 ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${utilization}%` }}
              />
            </div>
          </div>
        </div>

        {/* Emergency resources */}
        <div className="rounded-lg border border-slate-600/80 bg-slate-700/30 p-3">
          <h4 className="text-sm font-semibold text-slate-300 mb-2">Required emergency units</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-red-400">🚑</span>
              <span>{emergency_resources?.ambulances_needed ?? 0} Ambulances</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sky-400">🚤</span>
              <span>{emergency_resources?.rescue_boats_needed ?? 0} Boats</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">👨‍⚕️</span>
              <span>{emergency_resources?.medical_teams_needed ?? 0} Medical teams</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400">🚌</span>
              <span>{emergency_resources?.evacuation_buses_needed ?? 0} Buses</span>
            </div>
          </div>
        </div>

        {/* AI explanation */}
        <div className="rounded-lg border border-sky-500/30 bg-gradient-to-br from-sky-900/20 to-violet-900/20 p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-sky-300 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI analysis
            </h4>
            <Badge variant="info">
              {((ai_explanation?.confidence_score ?? 0) * 100).toFixed(0)}% confidence
            </Badge>
          </div>
          <p className="text-sm text-slate-300 mb-3">{ai_explanation?.recommendation}</p>
          <details className="text-xs">
            <summary className="cursor-pointer text-slate-400 hover:text-slate-300 select-none">
              Methodology & limitations
            </summary>
            <div className="mt-2 space-y-2 text-slate-400">
              <p><strong className="text-slate-300">Methodology:</strong> {ai_explanation?.methodology}</p>
              <p><strong className="text-slate-300">Factors:</strong> {ai_explanation?.factors_considered?.join(', ')}</p>
              <p><strong className="text-slate-300">Limitations:</strong></p>
              <ul className="list-disc list-inside space-y-0.5">
                {ai_explanation?.limitations?.map((lim, i) => (
                  <li key={i}>{lim}</li>
                ))}
              </ul>
            </div>
          </details>
        </div>

        {/* Copy / Print report */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopyReport}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-700/80 hover:bg-slate-600/80 text-slate-300 font-medium py-2 px-4 transition-colors text-sm"
          >
            {copyFeedback ? (
              <>✓ Copied!</>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h2m0 0h2v2m0-2v2m0 2h2m0 2v2m0 2h-2m2 2h2a2 2 0 002-2v-2m0 2V6a2 2 0 00-2-2h-2m-2 2h2m2-4h-2m0 0V6a2 2 0 012-2h2a2 2 0 012 2v2" />
                </svg>
                Copy report
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handlePrintReport}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-700/80 hover:bg-slate-600/80 text-slate-300 font-medium py-2 px-4 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12H5a2 2 0 00-2 2v4a2 2 0 002 2h2" />
            </svg>
            Print report
          </button>
        </div>

        {/* Human override */}
        <div className="pt-1">
          {!showOverrideConfirm ? (
            <button
              type="button"
              onClick={() => setShowOverrideConfirm(true)}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-700/80 hover:bg-slate-600/80 text-slate-300 font-medium py-2 px-4 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Human override
            </button>
          ) : (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
              <p className="text-sm text-amber-200/90 mb-2">
                Override AI recommendations? This will log your decision for accountability.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onHumanOverride();
                    setShowOverrideConfirm(false);
                  }}
                  className="flex-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium py-1.5 transition-colors"
                >
                  Confirm override
                </button>
                <button
                  type="button"
                  onClick={() => setShowOverrideConfirm(false)}
                  className="flex-1 rounded-lg bg-slate-600 hover:bg-slate-500 text-white text-sm font-medium py-1.5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
