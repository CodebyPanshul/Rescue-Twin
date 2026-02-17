import { useEffect, useMemo, useState } from 'react';
import { Panel } from './ui/Panel';
import { getAvailableAmbulances, getNearestAmbulance } from '../services/api';
import { getDirectionsUrl } from '../lib/geoUtils';

const AMB_ICON = (
  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13l2-2m0 0l2-2m-2 2h7a4 4 0 014 4v1m0 0h3m-3 0l-1 2m-2 0H7a4 4 0 01-4-4v-3a2 2 0 012-2h2" />
  </svg>
);

export default function AmbulancesPanel({ simulationData, resourceAssignments = [] }) {
  const [ambulances, setAmbulances] = useState([]);
  const [nearestByDistrict, setNearestByDistrict] = useState({});
  const [loadingNearest, setLoadingNearest] = useState(false);
  const [showList, setShowList] = useState(false);

  const topRiskDistricts = useMemo(() => {
    if (!simulationData?.flood_zones?.length) return [];
    const flooded = simulationData.flood_zones.filter((z) => z.is_flooded);
    flooded.sort((a, b) => b.risk_score - a.risk_score || b.affected_population - a.affected_population);
    return flooded.slice(0, 3).map(({ district_id, district_name }) => ({ id: district_id, name: district_name }));
  }, [simulationData]);

  useEffect(() => {
    let active = true;
    let timer = null;
    const tick = async () => {
      try {
        const list = await getAvailableAmbulances();
        if (!active) return;
        setAmbulances(Array.isArray(list) ? list : []);
      } finally {
        if (active) timer = setTimeout(tick, 5000);
      }
    };
    tick();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!topRiskDistricts.length) {
        setNearestByDistrict({});
        return;
      }
      setLoadingNearest(true);
      try {
        const results = {};
        for (const d of topRiskDistricts) {
          // eslint-disable-next-line no-await-in-loop
          const res = await getNearestAmbulance(d.id);
          results[d.id] = res?.found ? res : null;
        }
        if (!cancelled) setNearestByDistrict(results);
      } finally {
        if (!cancelled) setLoadingNearest(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [topRiskDistricts]);

  const assignedAmbulanceCount = useMemo(() => {
    if (!Array.isArray(resourceAssignments) || resourceAssignments.length === 0) return 0;
    const ids = new Set(resourceAssignments.filter(a => a.resource_type === 'ambulance').map(a => a.resource_id));
    return ids.size;
  }, [resourceAssignments]);

  const badgeText = useMemo(() => {
    const totalAvail = ambulances.length || 0;
    return `${assignedAmbulanceCount}/${totalAvail}`;
  }, [assignedAmbulanceCount, ambulances.length]);

  return (
    <Panel
      title="Ambulances"
      icon={AMB_ICON}
      badge={badgeText}
    >
      <div className="space-y-3">
        <div>
          <button
            type="button"
            onClick={() => setShowList((s) => !s)}
            className="w-full flex items-center justify-between rounded-lg border border-slate-600/80 bg-slate-700/40 hover:bg-slate-700/60 text-slate-200 px-3 py-2 text-sm transition-colors"
            aria-expanded={showList}
          >
            <span className="font-semibold">Ambulances</span>
            <span className="inline-flex items-center gap-2">
              <span className="text-xs text-slate-400">{ambulances.length}</span>
              <svg className={`w-4 h-4 transition-transform ${showList ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>
          {showList && (
            <>
              {ambulances.length === 0 ? (
                <div className="text-sm text-slate-400 mt-2">No available ambulances.</div>
              ) : (
                <div className="space-y-2 mt-2">
                  {ambulances.slice(0, 10).map((a) => (
                    <div key={a.id} className="rounded-lg border border-slate-600/80 bg-slate-700/30 p-3 text-sm flex items-center justify-between gap-2">
                      <div className="text-slate-200 font-medium">Ambulance {a.id}</div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${a.location.lat},${a.location.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 rounded text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white"
                      >
                        Open in Google Maps
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="pt-2 border-t border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-slate-200">Nearest per top-3 risk zones</h4>
            {loadingNearest && <span className="text-xs text-slate-500">Finding…</span>}
          </div>
          {topRiskDistricts.length === 0 ? (
            <div className="text-sm text-slate-400">Run a flood simulation to get risk zones.</div>
          ) : (
            <div className="space-y-2">
              {topRiskDistricts.map((d) => {
                const item = nearestByDistrict[d.id];
                const has = item && item.found;
                const link = has && item?.ambulance?.location
                  ? getDirectionsUrl(
                      item.ambulance.location.lat,
                      item.ambulance.location.lng,
                      item?.path?.[item.path.length - 1]?.lat ?? item.ambulance.location.lat,
                      item?.path?.[item.path.length - 1]?.lng ?? item.ambulance.location.lng
                    )
                  : null;
                return (
                  <div key={d.id} className="rounded-lg border border-slate-600/80 bg-slate-700/30 p-3 text-sm">
                    <div className="font-medium text-slate-200 mb-1">{d.name}</div>
                    {!has ? (
                      <div className="text-slate-400">No ambulance found nearby.</div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-slate-400">
                          <span className="mr-3">Ambulance {item.ambulance.id}</span>
                          <span className="mr-3">{item.distance_km} km</span>
                          <span>{(item.estimated_time_minutes ?? 0).toFixed(0)} min</span>
                        </div>
                        {link && (
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 rounded text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white"
                          >
                            Directions
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
