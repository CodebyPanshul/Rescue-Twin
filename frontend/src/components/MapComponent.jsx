'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, Marker, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { DISTRICT_POLYGONS } from '../constants/mapData';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const shelterIcon = new L.DivIcon({
  className: 'custom-shelter-icon',
  html: `<div style="width:32px;height:32px;background:#22c55e;border-radius:50%;border:3px solid #0f172a;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
    <svg width="18" height="18" fill="white" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const userLocationIcon = new L.DivIcon({
  className: 'user-location-icon',
  html: `<div style="width:28px;height:28px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;">
    <div style="width:8px;height:8px;background:white;border-radius:50%;"></div>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

const RISK_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#eab308',
  safe: '#22c55e',
};

function getRiskColor(riskScore) {
  if (riskScore >= 0.7) return RISK_COLORS.high;
  if (riskScore >= 0.4) return RISK_COLORS.medium;
  if (riskScore >= 0.2) return RISK_COLORS.low;
  return RISK_COLORS.safe;
}

function getRiskOpacity(riskScore, isFlooded) {
  if (!isFlooded) return 0.2;
  return Math.min(0.25 + riskScore * 0.45, 0.7);
}

function MapBounds({ zones }) {
  const map = useMap();
  useEffect(() => {
    if (zones?.length) map.setView(MAP_CENTER, MAP_ZOOM);
  }, [zones, map]);
  return null;
}

/** Call invalidateSize so Leaflet recalculates container size (fixes blank map on mobile). */
function MapResizeFix() {
  const map = useMap();
  useEffect(() => {
    const run = () => {
      setTimeout(() => map.invalidateSize(), 100);
    };
    run();
    window.addEventListener('resize', run);
    return () => window.removeEventListener('resize', run);
  }, [map]);
  return null;
}

// India — Jammu and Kashmir state in focus
const MAP_CENTER = [33.5, 74.9];
const MAP_ZOOM = 8;
const DEFAULT_CENTER = MAP_CENTER;
const DEFAULT_ZOOM = MAP_ZOOM;

const LEGEND_ITEMS = [
  { label: 'High (≥70%)', color: RISK_COLORS.high },
  { label: 'Medium (40–70%)', color: RISK_COLORS.medium },
  { label: 'Low (20–40%)', color: RISK_COLORS.low },
  { label: 'Safe (<20%)', color: RISK_COLORS.safe },
];

// Human vulnerability overlay: elderly clusters, schools, hospitals, high-risk zones (simulated)
const VULNERABILITY_POINTS = [
  { lat: 34.08, lng: 74.78, type: 'elderly', label: 'Elderly cluster (Srinagar)', risk: 'high' },
  { lat: 34.22, lng: 74.35, type: 'school', label: 'School complex (Baramulla)', risk: 'critical' },
  { lat: 33.73, lng: 75.15, type: 'hospital', label: 'District hospital (Anantnag)', risk: 'critical' },
  { lat: 32.73, lng: 74.87, type: 'high_density', label: 'High-density housing (Jammu)', risk: 'high' },
  { lat: 34.52, lng: 74.27, type: 'elderly', label: 'Elderly cluster (Kupwara)', risk: 'medium' },
];

export default function MapComponent({
  simulationData,
  layers,
  isLoading,
  selectedDistrict,
  onDistrictClick,
  userLocation = null,
  nearestShelterId = null,
}) {
  const mapRef = useRef(null);

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 bg-slate-950/80 z-[1000] flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <span className="inline-block h-10 w-10 border-2 border-sky-500/30 border-t-sky-400 rounded-full animate-spin mb-4" />
            <p className="text-sky-400 font-medium">Running simulation…</p>
            <p className="text-slate-500 text-sm mt-1">Running simulation…</p>
          </div>
        </div>
      )}

      <MapContainer
        ref={mapRef}
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full rounded-xl"
        style={{ minHeight: '280px' }}
        zoomControl
      >
        <MapResizeFix />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBounds zones={simulationData?.flood_zones || simulationData?.earthquake_zones} />

        {/* Flood zones */}
        {layers.floodZones && simulationData?.flood_zones?.map((zone) => {
          const polygon = DISTRICT_POLYGONS[zone.district_id];
          if (!polygon) return null;
          const fill = getRiskColor(zone.risk_score);
          const opacity = getRiskOpacity(zone.risk_score, zone.is_flooded);
          return (
            <Polygon
              key={zone.district_id}
              positions={polygon}
              pathOptions={{
                color: fill,
                fillColor: fill,
                fillOpacity: opacity,
                weight: selectedDistrict === zone.district_id ? 4 : 2,
              }}
              eventHandlers={{ click: () => onDistrictClick?.(zone) }}
            >
              <Popup>
                <div className="min-w-[200px] text-slate-200">
                  <h3 className="font-semibold text-base mb-2">{zone.district_name}</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-slate-500">Risk:</span>{' '}
                      <span className="font-medium">{(zone.risk_score * 100).toFixed(0)}%</span>
                    </p>
                    <p>
                      <span className="text-slate-500">Status:</span>{' '}
                      <span className={zone.is_flooded ? 'text-red-400' : 'text-emerald-400'}>
                        {zone.is_flooded ? 'Flooded' : 'Safe'}
                      </span>
                    </p>
                    {zone.flood_depth > 0 && (
                      <p><span className="text-slate-500">Depth:</span> <span className="text-sky-400">{zone.flood_depth}m</span></p>
                    )}
                    <p>
                      <span className="text-slate-500">Affected:</span>{' '}
                      <span className="font-medium">{zone.affected_population.toLocaleString()}</span>
                    </p>
                  </div>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* Earthquake intensity zones */}
        {layers.floodZones && simulationData?.earthquake_zones?.map((zone) => {
          const polygon = DISTRICT_POLYGONS[zone.district_id];
          if (!polygon) return null;
          const fill = getRiskColor(zone.intensity_score);
          const opacity = zone.intensity_score >= 0.2 ? Math.min(0.3 + zone.intensity_score * 0.5, 0.75) : 0.2;
          return (
            <Polygon
              key={zone.district_id}
              positions={polygon}
              pathOptions={{
                color: fill,
                fillColor: fill,
                fillOpacity: opacity,
                weight: selectedDistrict === zone.district_id ? 4 : 2,
              }}
              eventHandlers={{ click: () => onDistrictClick?.(zone) }}
            >
              <Popup>
                <div className="min-w-[200px] text-slate-200">
                  <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                    {zone.district_name}
                    {zone.is_epicenter && <span className="text-xs bg-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded">Epicenter</span>}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-slate-500">Intensity:</span> <span className="font-medium">{zone.intensity_label}</span></p>
                    <p><span className="text-slate-500">Distance:</span> <span className="text-sky-400">{zone.distance_km} km</span></p>
                    <p><span className="text-slate-500">Affected:</span> <span className="font-medium">{zone.affected_population.toLocaleString()}</span></p>
                  </div>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {layers.routes && simulationData?.evacuation_routes?.map((route, i) => (
          <Polyline
            key={`route-${i}`}
            positions={route.path.map((c) => [c.lat, c.lng])}
            pathOptions={{
              color: route.is_accessible ? '#22c55e' : '#f59e0b',
              weight: 4,
              dashArray: route.is_accessible ? '10, 6' : '6, 10',
              opacity: 0.85,
            }}
          >
            <Popup>
              <div className="min-w-[180px] text-slate-200">
                <h3 className="font-semibold text-base mb-2">Evacuation route</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-slate-500">From:</span> {route.from_district}</p>
                  <p><span className="text-slate-500">To:</span> {route.to_shelter}</p>
                  <p><span className="text-slate-500">Distance:</span> <span className="text-sky-400">{route.distance_km} km</span></p>
                  <p><span className="text-slate-500">Time:</span> <span className="text-sky-400">{route.estimated_time_minutes.toFixed(0)} min</span></p>
                  <p>
                    <span className="text-slate-500">Status:</span>{' '}
                    <span className={route.is_accessible ? 'text-emerald-400' : 'text-amber-400'}>
                      {route.is_accessible ? 'Accessible' : 'Partially blocked'}
                    </span>
                  </p>
                </div>
              </div>
            </Popup>
          </Polyline>
        ))}

        {/* Human vulnerability overlay */}
        {layers.vulnerability && VULNERABILITY_POINTS.map((point, i) => (
          <CircleMarker
            key={`vuln-${i}`}
            center={[point.lat, point.lng]}
            pathOptions={{
              radius: point.risk === 'critical' ? 12 : 8,
              color: point.risk === 'critical' ? '#dc2626' : '#f59e0b',
              fillColor: point.risk === 'critical' ? '#ef4444' : '#f59e0b',
              fillOpacity: 0.7,
              weight: 2,
            }}
          >
            <Popup>
              <div className="min-w-[180px] text-slate-200">
                <h3 className="font-semibold text-base mb-1 flex items-center gap-2">
                  <span className="text-amber-400">👥</span>
                  {point.label}
                </h3>
                <p className="text-xs text-slate-400">Type: {point.type.replace('_', ' ')}</p>
                <p className="text-xs font-medium text-red-400">Critical Human Risk Zone</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* User's live location */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userLocationIcon}
          >
            <Popup>
              <div className="min-w-[160px] text-slate-200">
                <h3 className="font-semibold text-base mb-1 flex items-center gap-2">
                  <span className="text-blue-400">📍</span> Your location
                </h3>
                <p className="text-xs text-slate-400">{userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {layers.shelters && simulationData?.shelters?.map((shelter) => (
          <Marker
            key={shelter.id}
            position={[shelter.location.lat, shelter.location.lng]}
            icon={shelterIcon}
          >
            <Popup>
              <div className="min-w-[180px] text-slate-200">
                <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  {shelter.name}
                  {nearestShelterId === shelter.id && (
                    <span className="text-xs bg-sky-500/30 text-sky-300 px-1.5 py-0.5 rounded">Nearest</span>
                  )}
                </h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-slate-500">Capacity:</span> {shelter.capacity.toLocaleString()}</p>
                  <p><span className="text-slate-500">Occupancy:</span> <span className="text-emerald-400">{shelter.current_occupancy.toLocaleString()}</span></p>
                  <p><span className="text-slate-500">Available:</span> <span className="text-sky-400">{(shelter.capacity - shelter.current_occupancy).toLocaleString()}</span></p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[999] rounded-lg border border-slate-700/80 bg-slate-900/95 backdrop-blur-sm px-3 py-2.5 shadow-xl">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Risk level</h4>
        <div className="space-y-1.5">
          {LEGEND_ITEMS.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2 text-xs text-slate-300">
              <span
                className="w-4 h-3 rounded shrink-0"
                style={{ backgroundColor: color }}
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
