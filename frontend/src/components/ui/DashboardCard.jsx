'use client';

import { Card, CardContent } from './Card';

/**
 * Command-center / dashboard section: card with consistent header (title, optional icon, optional badge).
 * Use for Resource Optimization, Strategic Actions, Cascading Chain, etc.
 */
export function DashboardCard({ title, icon, badge, children, className = '', headerAction }) {
  return (
    <Card className={`dashboard-card overflow-hidden ${className}`} padding="none">
      <div className="px-4 py-3 border-b border-slate-700/80 flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-semibold text-slate-200 flex items-center gap-2">
          {icon != null && <span className="text-xl" aria-hidden>{icon}</span>}
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {headerAction}
          {badge != null && badge}
        </div>
      </div>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}
