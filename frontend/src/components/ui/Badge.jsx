const variants = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  advisory: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  normal: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  info: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
};

export function Badge({ children, variant = 'info', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${variants[variant] ?? variants.info} ${className}`}
    >
      {children}
    </span>
  );
}
