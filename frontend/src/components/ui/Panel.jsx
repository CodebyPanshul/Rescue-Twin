import { Card, CardContent } from './Card';

export function Panel({ title, icon, children, className = '', badge }) {
  return (
    <Card className={`flex flex-col overflow-hidden ${className}`} padding="none">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/80">
        <span className="flex items-center gap-2 font-semibold text-slate-200">
          {icon}
          {title}
        </span>
        {badge != null && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-700/80 text-slate-300">
            {badge}
          </span>
        )}
      </div>
      <CardContent className="p-4 flex-1 overflow-y-auto">{children}</CardContent>
    </Card>
  );
}
