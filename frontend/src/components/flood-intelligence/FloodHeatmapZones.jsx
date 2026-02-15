'use client';

/** Color-coded heatmap-style zone display for flood intensity. */
function getColor(intensity) {
  if (intensity >= 0.7) return 'bg-red-500/80 text-white';
  if (intensity >= 0.4) return 'bg-amber-500/80 text-slate-900';
  if (intensity >= 0.2) return 'bg-yellow-500/70 text-slate-900';
  return 'bg-emerald-500/60 text-slate-900';
}

export default function FloodHeatmapZones({ zoneHeatmap = [] }) {
  if (!zoneHeatmap.length) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 text-center text-slate-500 text-sm">
        No zone data. Run live model.
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Zone intensity</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {zoneHeatmap.map((z) => (
          <div
            key={z.district_id}
            className={`rounded-lg px-3 py-2 text-center transition-transform hover:scale-[1.02] ${getColor(z.intensity)}`}
          >
            <div className="font-semibold text-sm truncate">{z.district_name}</div>
            <div className="text-xs opacity-90">{(z.intensity * 100).toFixed(0)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
