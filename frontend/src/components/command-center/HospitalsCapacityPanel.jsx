'use client';

import { useEffect, useState } from 'react';
import { DashboardCard } from '../ui/DashboardCard';
import { getHospitals } from '../../services/api';

export default function HospitalsCapacityPanel() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    let interval = null;
    const load = async () => {
      try {
        const list = await getHospitals();
        if (!active) return;
        setHospitals(Array.isArray(list) ? list : []);
        setError(null);
      } catch (e) {
        if (!active) return;
        setError(e.message || 'Failed to load hospitals');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    interval = setInterval(load, 30000);
    return () => { active = false; if (interval) clearInterval(interval); };
  }, []);

  const overloaded = hospitals.filter(h => (h.capacity > 0) && ((h.current_occupancy / h.capacity) >= 0.9)).length;
  const badge = (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-slate-700/80 text-slate-300">
      {overloaded} overloaded
    </span>
  );

  return (
    <DashboardCard title="Hospital Capacity & Diversion" icon="🏥" badge={badge}>
      {loading ? (
        <div className="text-sm text-slate-400">Loading…</div>
      ) : error ? (
        <div className="text-sm text-red-400">{error}</div>
      ) : hospitals.length === 0 ? (
        <div className="text-sm text-slate-400">No hospitals available.</div>
      ) : (
        <div className="space-y-3">
          {hospitals.map((h) => {
            const cap = h.capacity || 0;
            const occ = h.current_occupancy || 0;
            const util = cap > 0 ? Math.min(100, Math.round((occ / cap) * 100)) : 0;
            const overloaded = util >= 90;
            return (
              <div key={h.id} className="rounded-lg border border-slate-700 bg-slate-800/60 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-medium text-slate-200">{h.name}</div>
                  <div className={`text-xs font-medium ${overloaded ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {overloaded ? 'Diversion advised' : 'Accepting'}
                  </div>
                </div>
                <div className="text-xs text-slate-400 mb-2">{occ}/{cap} occupied</div>
                <div className="h-2 rounded bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full ${overloaded ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${util}%` }}
                  />
                </div>
                {h.icu_capacity != null && (
                  <div className="text-xs text-slate-500 mt-1">ICU {h.icu_occupied ?? 0}/{h.icu_capacity}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardCard>
  );
}
