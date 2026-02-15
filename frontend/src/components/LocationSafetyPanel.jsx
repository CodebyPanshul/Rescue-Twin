'use client';

import { useMemo } from 'react';
import { getDistrictAtPoint, getZoneRiskForDistrict, getNearestShelter, getDirectionsUrl } from '../lib/geoUtils';
import { Panel } from './ui/Panel';

const LOCATION_ICON = (
  <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default function LocationSafetyPanel({
  position,
  error: locationError,
  loading: locationLoading,
  onRequestLocation,
  simulationData,
}) {
  const { zoneInfo, nearest } = useMemo(() => {
    if (!position) return { zoneInfo: null, nearest: null };
    const districtId = getDistrictAtPoint(position.lat, position.lng);
    const zoneInfo = simulationData && districtId
      ? getZoneRiskForDistrict(simulationData, districtId)
      : null;
    const nearest = simulationData?.shelters
      ? getNearestShelter(position.lat, position.lng, simulationData.shelters)
      : null;
    return { zoneInfo, nearest };
  }, [position, simulationData]);

  const directionsUrl = useMemo(() => {
    if (!position || !nearest?.shelter?.location) return null;
    const { lat, lng } = nearest.shelter.location;
    return getDirectionsUrl(position.lat, position.lng, lat, lng);
  }, [position, nearest]);

  if (!position && !locationLoading && !locationError) {
    return (
      <Panel title="Your location &amp; safety" icon={LOCATION_ICON}>
        <p className="text-sm text-slate-400 mb-4">
          Share your location to see if you&apos;re in a safe zone and get the nearest shelter with navigation.
        </p>
        <button
          type="button"
          onClick={onRequestLocation}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 px-4"
        >
          <span aria-hidden>📍</span>
          Share my location
        </button>
      </Panel>
    );
  }

  if (locationLoading) {
    return (
      <Panel title="Your location &amp; safety" icon={LOCATION_ICON}>
        <div className="flex items-center gap-2 text-slate-400 py-4">
          <span className="h-5 w-5 border-2 border-sky-500/30 border-t-sky-400 rounded-full animate-spin" />
          Getting your location…
        </div>
      </Panel>
    );
  }

  if (locationError) {
    return (
      <Panel title="Your location &amp; safety" icon={LOCATION_ICON}>
        <p className="text-sm text-red-400 mb-4">{locationError}</p>
        <button
          type="button"
          onClick={onRequestLocation}
          className="w-full rounded-lg border border-slate-600 bg-slate-700/80 hover:bg-slate-600 text-slate-300 py-2 text-sm"
        >
          Try again
        </button>
      </Panel>
    );
  }

  return (
    <Panel title="Your location &amp; safety" icon={LOCATION_ICON}>
      <div className="space-y-4">
        <div className="rounded-lg bg-slate-700/50 px-3 py-2 text-sm text-slate-300">
          <span className="text-slate-500">Coordinates:</span>{' '}
          {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
        </div>

        {zoneInfo ? (
          <div className={`rounded-lg border px-3 py-3 ${zoneInfo.isSafe ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-amber-500/40 bg-amber-500/10'}`}>
            <p className="text-sm font-medium text-slate-200">
              You are in <span className="font-semibold">{zoneInfo.districtName}</span>
            </p>
            <p className={zoneInfo.isSafe ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
              {zoneInfo.isSafe ? '✓ Safe zone' : '⚠ At risk — consider moving to a shelter'}
            </p>
            {!zoneInfo.isSafe && (
              <p className="text-xs text-slate-400 mt-1">Risk score: {(zoneInfo.riskScore * 100).toFixed(0)}%</p>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-slate-600 bg-slate-700/30 px-3 py-3 text-sm text-slate-400">
            Run a simulation to see if your location is in a safe or at-risk zone for the current scenario.
          </div>
        )}

        {nearest ? (
          <div className="rounded-lg border border-slate-600 bg-slate-700/30 px-3 py-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Nearest shelter</p>
            <p className="font-semibold text-slate-200">{nearest.shelter.name}</p>
            <p className="text-sm text-sky-400">{nearest.distanceKm} km away</p>
            {directionsUrl && (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium py-2 px-4"
              >
                Navigate to shelter
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        ) : simulationData?.shelters?.length ? null : (
          <p className="text-sm text-slate-500">Run a simulation to see the nearest shelter.</p>
        )}
      </div>
    </Panel>
  );
}
