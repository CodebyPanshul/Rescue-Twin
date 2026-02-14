export function MetricCard({ value, label, variant = 'default', icon }) {
  const valueClass = {
    default: 'text-slate-100',
    risk: 'text-red-400',
    population: 'text-sky-400',
    time: 'text-amber-400',
    zones: 'text-violet-400',
  }[variant] || valueClass.default;

  return (
    <div className="rounded-lg border border-slate-600/80 bg-slate-700/40 p-3 transition-colors hover:bg-slate-700/60">
      <div className={`text-xl font-bold tabular-nums ${valueClass}`}>
        {icon && <span className="mr-1.5 opacity-80">{icon}</span>}
        {value}
      </div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}
