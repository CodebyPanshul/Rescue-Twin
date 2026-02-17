'use client';

import { useState, useEffect, useCallback } from 'react';
import { getLiveFloodSnapshot } from '../../src/services/api';
import { getRiskBadgeClass } from '../../src/constants/riskLevels';
import RiskMeter from '../../src/components/flood-intelligence/RiskMeter';
import ComingSoonBanner from '../../src/components/flood-intelligence/ComingSoonBanner';
import FloodHeatmapZones from '../../src/components/flood-intelligence/FloodHeatmapZones';
import ProjectedFloodChart from '../../src/components/flood-intelligence/ProjectedFloodChart';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';

const REFRESH_INTERVAL_MS = 7000;

export default function FloodIntelligencePage() {
  const [snapshot, setSnapshot] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveRunning, setLiveRunning] = useState(true);
  const [showWhy, setShowWhy] = useState(false);
  const [idx, setIdx] = useState(null);

  const fetchSnapshot = useCallback(async () => {
    try {
      const data = await getLiveFloodSnapshot();
      setSnapshot(data);
      setHistory((h) => {
        const next = [...h, data].slice(-12);
        if (idx == null) {
          setIdx(next.length - 1);
        }
        return next;
      });
      setError(null);
    } catch (e) {
      setError(e.message || 'Failed to load live snapshot');
    } finally {
      setLoading(false);
    }
  }, [idx]);

  useEffect(() => {
    fetchSnapshot();
    if (!liveRunning) return;
    const id = setInterval(fetchSnapshot, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [liveRunning, fetchSnapshot]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 border-b border-slate-800 bg-slate-900/80 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 relative">
          <h1 className="text-lg sm:text-xl font-bold text-white">Real-Time Flood Intelligence</h1>
          {snapshot && (
            <>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${getRiskBadgeClass(snapshot.risk_level_label)}`}>
                {snapshot.risk_level_label}
              </span>
              <button
                type="button"
                onClick={() => setShowWhy((v) => !v)}
                className="px-2 py-1 rounded border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
                title="Why this level?"
              >
                Why?
              </button>
              {showWhy && snapshot?.risk_factors && (
                <div className="absolute top-full mt-2 left-0 z-10 w-64 rounded-lg border border-slate-700 bg-slate-900/95 p-3 shadow-xl">
                  <div className="text-xs text-slate-300 font-medium mb-2">Why this level?</div>
                  <div className="text-[11px] text-slate-400 space-y-1">
                    <div className="flex justify-between"><span>Water level</span><span>{(snapshot.risk_factors.normalized?.water_level ?? 0).toFixed(2)} × {(snapshot.risk_factors.weights?.water_level ?? 0)}</span></div>
                    <div className="flex justify-between"><span>Rainfall</span><span>{(snapshot.risk_factors.normalized?.rainfall ?? 0).toFixed(2)} × {(snapshot.risk_factors.weights?.rainfall ?? 0)}</span></div>
                    <div className="flex justify-between"><span>Extent radius</span><span>{(snapshot.risk_factors.normalized?.extent_radius ?? 0).toFixed(2)} × {(snapshot.risk_factors.weights?.extent_radius ?? 0)}</span></div>
                    <div className="pt-1 border-t border-slate-800/60 flex justify-between text-slate-300"><span>Total</span><span>{snapshot.risk_score.toFixed(2)}</span></div>
                  </div>
                </div>
              )}
            </>
          )}
          {liveRunning && snapshot && (
            <span className="live-indicator">Live</span>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-400">
          <input
            type="checkbox"
            checked={liveRunning}
            onChange={(e) => setLiveRunning(e.target.checked)}
            className="rounded border-slate-600 bg-slate-700 text-sky-500"
          />
          Auto-refresh
        </label>
      </div>

      {error && (
        <div className="shrink-0 px-4 py-2 bg-red-950/80 border-b border-red-900/50 text-red-200 text-sm flex items-center gap-2">
          <span>{error}</span>
          <button type="button" onClick={() => { setLoading(true); fetchSnapshot(); }} className="underline">Retry</button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Live Adaptive Digital Twin metrics */}
        <section className="dashboard-card p-4 sm:p-6">
          <h2 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <span className="text-xl">🌊</span>
            Live Adaptive Digital Twin
          </h2>
          {loading && !snapshot ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" className="shrink-0" />
              <span className="ml-3 text-slate-400">Loading live model…</span>
            </div>
          ) : snapshot ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                <div className="text-2xl font-bold text-sky-400">{snapshot.water_level_m} m</div>
                <div className="text-xs text-slate-400 mt-1">Water level (CWC – max across configured stations)</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                <div className="text-2xl font-bold text-amber-400">{snapshot.rainfall_intensity_mm_hr} mm/hr</div>
                <div className="text-xs text-slate-400 mt-1">Rainfall intensity (CWC – max across stations)</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                <div className="text-2xl font-bold text-orange-400">{snapshot.flood_spread_radius_km} km</div>
                <div className="text-xs text-slate-400 mt-1">Extent radius (Sentinel flood polygon centroid → farthest edge)</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                <div className="text-2xl font-bold text-red-400">{snapshot.risk_forecast_30min}</div>
                <div className="text-xs text-slate-400 mt-1">30-min risk forecast</div>
              </div>
            </div>
          ) : null}

          {snapshot && (
            <>
              <div className="mb-6">
                <RiskMeter value={snapshot.risk_score} label="Risk level" />
              </div>
              {history.length > 1 && (
                <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">Time</span>
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, history.length - 1)}
                      value={idx ?? 0}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setIdx(v);
                        setSnapshot(history[v]);
                      }}
                      className="flex-1"
                    />
                    <span className="text-xs text-slate-400">{(idx != null && history[idx]) ? new Date(history[idx].timestamp).toLocaleTimeString() : ''}</span>
                  </div>
                </div>
              )}
              {Array.isArray(snapshot.stations) && snapshot.stations.length > 0 && (
                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 mb-4">
                  <h3 className="text-sm font-semibold text-slate-200 mb-3">Top gauges</h3>
                  <div className="space-y-2">
                    {snapshot.stations.map((s, i) => {
                      const name = s.station || `Station ${i + 1}`;
                      const wl = s.water_level_m != null ? `${s.water_level_m} m` : '–';
                      const rf = s.rainfall_mm_hr != null ? `${s.rainfall_mm_hr} mm/hr` : '–';
                      const link = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' Jammu Kashmir')}`;
                      return (
                        <div key={`${name}-${i}`} className="flex items-center justify-between gap-4 rounded-lg border border-slate-700/70 bg-slate-900/40 p-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-slate-200 text-sm truncate">{name}</div>
                            <div className="text-xs text-slate-400 mt-0.5">WL {wl} • Rain {rf}</div>
                          </div>
                          <a href={link} target="_blank" rel="noopener noreferrer" className="px-2 py-1 rounded text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white shrink-0">
                            Maps
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProjectedFloodChart
                  riskScore={snapshot.risk_score}
                  waterLevel={snapshot.water_level_m}
                  rainfallIntensity={snapshot.rainfall_intensity_mm_hr}
                  radiusKm={snapshot.flood_spread_radius_km}
                />
                <FloodHeatmapZones zoneHeatmap={snapshot.zone_heatmap} />
              </div>
            </>
          )}
        </section>

        {/* Coming Soon banner */}
        <ComingSoonBanner />
      </div>
    </div>
  );
}
