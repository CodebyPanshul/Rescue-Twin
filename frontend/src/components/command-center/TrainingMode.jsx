'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DashboardCard } from '../ui/DashboardCard';

export default function TrainingMode() {
  const [manualAllocation, setManualAllocation] = useState({ ambulances: 5, teams: 2 });
  const [outcome, setOutcome] = useState(null);

  const runPractice = () => {
    const manualScore = Math.min(95, 60 + manualAllocation.ambulances * 2 + manualAllocation.teams * 5);
    const aiScore = 85;
    setOutcome({
      manualScore,
      aiScore,
      recommendation: aiScore > manualScore
        ? `AI allocation would reduce response time by ${aiScore - manualScore} points in this scenario.`
        : 'Your allocation is close to optimal.',
    });
  };

  return (
    <DashboardCard title="Simulation Training Mode" icon="🎓">
      <p className="text-sm text-slate-400 mb-4">
        Run practice scenarios, allocate resources manually, see consequence outcomes, and compare with AI-optimized decisions.
      </p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Ambulances to deploy</label>
          <input
            type="number"
            min={1}
            max={20}
            value={manualAllocation.ambulances}
            onChange={(e) => setManualAllocation((s) => ({ ...s, ambulances: Number(e.target.value) || 1 }))}
            className="w-full rounded-lg border border-slate-600 bg-slate-700/80 px-3 py-2 text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Rescue teams</label>
          <input
            type="number"
            min={1}
            max={10}
            value={manualAllocation.teams}
            onChange={(e) => setManualAllocation((s) => ({ ...s, teams: Number(e.target.value) || 1 }))}
            className="w-full rounded-lg border border-slate-600 bg-slate-700/80 px-3 py-2 text-white text-sm"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={runPractice}
          className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium"
        >
          Run practice scenario
        </button>
        <Link
          href="/command-center"
          className="px-4 py-2 rounded-lg border border-slate-600 bg-slate-700/80 hover:bg-slate-600 text-slate-300 text-sm font-medium"
        >
          Use AI optimization
        </Link>
      </div>
      {outcome && (
        <div className="mt-4 rounded-lg border border-slate-700 bg-slate-800/50 p-4 space-y-2">
          <h4 className="text-sm font-semibold text-slate-200">Outcome comparison</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>Manual allocation score: <span className="font-bold text-amber-400">{outcome.manualScore}</span></div>
            <div>AI-optimized score: <span className="font-bold text-emerald-400">{outcome.aiScore}</span></div>
          </div>
          <p className="text-xs text-slate-400">{outcome.recommendation}</p>
        </div>
      )}
    </DashboardCard>
  );
}
