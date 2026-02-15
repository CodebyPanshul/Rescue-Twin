'use client';

/** Simple projected flood growth chart (next 30–60 min trend). */
export default function ProjectedFloodChart({ riskScore = 0.5, waterLevel = 1.5 }) {
  // Simulate 6 time steps (e.g. every 10 min)
  const steps = 6;
  const base = riskScore;
  const points = Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1);
    return Math.min(1, base * (0.7 + 0.5 * t) + (waterLevel / 4) * 0.2 * t);
  });
  const maxVal = Math.max(...points);
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Projected flood growth (30 min)</h4>
      <div className="h-24 flex items-end gap-1">
        {points.map((p, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-gradient-to-t from-sky-600 to-sky-400 min-h-[4px] transition-all duration-300"
            style={{ height: `${(p / (maxVal || 1)) * 100}%` }}
            title={`T+${i * 10} min: ${(p * 100).toFixed(0)}%`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1 text-[10px] text-slate-500">
        <span>Now</span>
        <span>+30 min</span>
      </div>
    </div>
  );
}
