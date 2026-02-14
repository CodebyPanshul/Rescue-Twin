export function Card({ children, className = '', padding = 'default', ...rest }) {
  const paddingClass = padding === 'none' ? 'p-0' : padding === 'tight' ? 'p-3' : 'p-4';
  return (
    <div
      className={`rounded-xl border border-slate-700/80 bg-slate-800/60 backdrop-blur-sm ${paddingClass} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`border-b border-slate-700/80 pb-3 mb-3 font-semibold text-slate-200 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}
