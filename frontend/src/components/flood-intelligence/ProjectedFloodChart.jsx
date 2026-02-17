'use client';

/** Projected flood growth chart with confidence band (next 30 min, 5‑min steps). */
export default function ProjectedFloodChart({
  riskScore = 0.5,
  waterLevel = 1.5,
  rainfallIntensity = 0,
  radiusKm = 0,
}) {
  // Normalize drivers
  const wl = Math.min(waterLevel / 6, 1);        // assume 0–6 m typical gauge band
  const rf = Math.min(rainfallIntensity / 120, 1); // 0–120 mm/hr scale
  const rd = Math.min(radiusKm / 15, 1);        // 0–15 km characteristic radius

  // Growth driver blends current conditions; higher rainfall/radius push growth upward
  const driver = Math.max(0, Math.min(1, 0.4 * riskScore + 0.35 * rf + 0.25 * rd));
  const steps = 7; // 0, +5, +10, …, +30

  // Mean projection and simple confidence band
  const mean = [];
  const low = [];
  const high = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1); // 0..1 across 30 minutes
    const growth = driver * (0.1 + 0.35 * t) + wl * 0.05 * t; // gentle ramp
    const val = Math.max(0, Math.min(1, riskScore + growth));
    const band = 0.08 * (0.5 + 0.5 * rf) * (0.2 + 0.8 * t); // wider later if rainfall high
    mean.push(val);
    low.push(Math.max(0, val - band));
    high.push(Math.min(1, val + band));
  }

  // SVG sizing
  const W = 260;
  const H = 120;
  const pad = 8;
  const dx = (W - 2 * pad) / (steps - 1);
  const scaleY = (v) => H - pad - v * (H - 2 * pad);
  const scaleX = (i) => pad + i * dx;

  const path = (arr) =>
    arr.map((v, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)},${scaleY(v)}`).join(' ');
  const bandPath = () => {
    const upper = high.map((v, i) => [scaleX(i), scaleY(v)]);
    const lower = low.map((v, i) => [scaleX(steps - 1 - i), scaleY(low[steps - 1 - i])]);
    const pts = [...upper, ...lower];
    return `M ${pts[0][0]},${pts[0][1]} ` + pts.slice(1).map(([x, y]) => `L ${x},${y}`).join(' ') + ' Z';
  };

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Projected flood growth (30 min)
        </h4>
        <div className="text-[10px] text-slate-500">
          wl:{waterLevel}m • rain:{rainfallIntensity}mm/hr • R:{radiusKm}km
        </div>
      </div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Projected flood growth chart">
        <defs>
          <linearGradient id="riskLine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
          <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(56,189,248,0.35)" />
            <stop offset="100%" stopColor="rgba(14,165,233,0.15)" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={W} height={H} fill="transparent" />
        <path d={bandPath()} fill="url(#bandFill)" stroke="none" />
        <path d={path(mean)} stroke="url(#riskLine)" strokeWidth="2.5" fill="none" />
        {mean.map((v, i) => (
          <circle key={i} cx={scaleX(i)} cy={scaleY(v)} r="2" fill="#38bdf8" />
        ))}
        {/* Y-axis markers */}
        {[0, 0.5, 1].map((y, i) => (
          <g key={i}>
            <line x1={pad} x2={W - pad} y1={scaleY(y)} y2={scaleY(y)} stroke="#1f2937" strokeDasharray="2,3" />
            <text x={W - pad} y={scaleY(y) - 2} textAnchor="end" fontSize="9" fill="#94a3b8">
              {(y * 100).toFixed(0)}%
            </text>
          </g>
        ))}
        {/* X-axis labels */}
        <text x={pad} y={H - 2} fontSize="9" fill="#94a3b8">Now</text>
        <text x={W - pad} y={H - 2} textAnchor="end" fontSize="9" fill="#94a3b8">+30 min</text>
      </svg>
    </div>
  );
}
