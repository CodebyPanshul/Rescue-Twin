import { useMemo } from 'react';
import { Panel } from './ui/Panel';
import { getDirectionsUrl } from '../lib/geoUtils';

const ROUTE_ICON = (
  <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l3-3m0 0l3 3m-3-3v-4m0 4H7a4 4 0 110-8h10a2 2 0 002-2V5" />
  </svg>
);

function routeKey(r) {
  return `${r.from_district}|${r.to_shelter}|${r.rank ?? 0}`;
}

export default function RoutesPanel({
  simulationData,
  selectedDistrict,
  highlightedRouteKey = null,
  onHighlightRoute = () => {},
}) {
  const routes = simulationData?.evacuation_routes || [];
  const districtRoutes = useMemo(() => {
    if (!routes.length) return [];
    if (!selectedDistrict) return [];
    return routes
      .filter((r) => r.from_district === selectedDistrict)
      .slice()
      .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0) || a.distance_km - b.distance_km);
  }, [routes, selectedDistrict]);

  return (
    <Panel
      title="Evacuation routing"
      icon={ROUTE_ICON}
      badge={districtRoutes?.length ? `${districtRoutes.length}` : undefined}
    >
      {!selectedDistrict ? (
        <div className="text-sm text-slate-400">
          Select a district on the map to view its evacuation routes.
        </div>
      ) : districtRoutes.length === 0 ? (
        <div className="text-sm text-slate-400">
          No routes found for this district. Try another district or rerun the simulation.
        </div>
      ) : (
        <div className="space-y-2">
          {districtRoutes.map((r, i) => {
            const key = routeKey(r);
            const isActive = highlightedRouteKey === key;
            const start = r.path?.[0];
            const end = r.path?.[r.path.length - 1];
            const gmaps = start && end
              ? getDirectionsUrl(start.lat, start.lng, end.lat, end.lng)
              : null;
            return (
              <div
                key={`${r.to_shelter}-${r.rank ?? 0}-${i}`}
                className={`rounded-lg border p-3 text-sm transition-colors ${
                  isActive ? 'border-sky-500/60 bg-sky-500/10' : 'border-slate-600/80 bg-slate-700/30'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs ${
                        (r.rank ?? 0) === 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-600 text-slate-300'
                      }`}>
                        {(r.rank ?? 0) === 0 ? 'Best' : `Alt ${r.rank}`}
                      </span>
                      <span className="font-medium text-slate-200 truncate">
                        {r.to_shelter_name || r.to_shelter}
                      </span>
                    </div>
                    <div className="mt-1 text-slate-400">
                      <span className="mr-3">{r.distance_km} km</span>
                      <span>{r.estimated_time_minutes.toFixed(0)} min</span>
                    </div>
                    <div className="mt-1">
                      <span className={`text-xs font-medium ${r.is_accessible ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {r.is_accessible ? 'Accessible' : 'Partially blocked'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onHighlightRoute(isActive ? null : key)}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        isActive ? 'bg-sky-600 text-white' : 'bg-slate-600 hover:bg-slate-500 text-slate-200'
                      }`}
                      aria-pressed={isActive}
                    >
                      {isActive ? 'Clear' : 'Highlight'}
                    </button>
                    {gmaps && (
                      <a
                        href={gmaps}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 rounded text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white text-center"
                      >
                        Directions
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
