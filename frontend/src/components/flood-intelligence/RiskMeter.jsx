'use client';

/** Animated risk meter 0–100% with color zones (Low → Critical). */
export default function RiskMeter({ value, label = 'Risk level', showLabel = true }) {
  const pct = Math.min(100, Math.max(0, typeof value === 'number' ? value * 100 : 0));
  const zone = pct >= 75 ? 'critical' : pct >= 50 ? 'high' : pct >= 25 ? 'moderate' : 'low';
  const colors = {
    low: 'from-emerald-500 to-sky-500',
    moderate: 'from-amber-500 to-orange-500',
    high: 'from-orange-500 to-red-500',
    critical: 'from-red-500 to-red-700',
  };
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>{label}</span>
          <span className="font-medium text-slate-300">{pct.toFixed(0)}%</span>
        </div>
      )}
      <div className="h-4 sm:h-5 w-full rounded-full bg-slate-700 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${colors[zone]} transition-all duration-500 ease-out animate-risk-meter`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-[10px] text-slate-500">
        <span>Low</span>
        <span>Critical</span>
      </div>
    </div>
  );
}
