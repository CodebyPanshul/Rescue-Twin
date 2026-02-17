'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
// Use direct import to avoid dynamic chunk loader issues in dev
import { useEmergencyMode } from '../../src/context/EmergencyContext';
import { useSimulation } from '../../src/hooks/useSimulation';
import { useGeolocation } from '../../src/hooks/useGeolocation';
import { getNearestShelter } from '../../src/lib/geoUtils';
import ControlPanel from '../../src/components/ControlPanel';
import DecisionPanel from '../../src/components/DecisionPanel';
import LocationSafetyPanel from '../../src/components/LocationSafetyPanel';
import RoutesPanel from '../../src/components/RoutesPanel';
import AmbulancesPanel from '../../src/components/AmbulancesPanel';
import { getResources, assignResources, getHospitals } from '../../src/services/api';

import MapComponent from '../../src/components/MapComponent';

export default function SimulationPage() {
  const { emergencyMode } = useEmergencyMode();
  const [isFullscreenMap, setIsFullscreenMap] = useState(false);
  const { position: userLocation, error: locationError, loading: locationLoading, requestLocation } = useGeolocation();
  const [resources, setResources] = useState([]);
  const [resourceAssignments, setResourceAssignments] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const {
    simulationData,
    isLoading,
    error,
    disasterType,
    setDisasterType,
    severity,
    setSeverity,
    rainfallOverride,
    setRainfallOverride,
    magnitude,
    setMagnitude,
    epicenter,
    setEpicenter,
    selectedDistrict,
    highlightedRouteKey,
    setHighlightedRouteKey,
    layers,
    showOverrideConfirm,
    backendStatus,
    runSimulation,
    runDemo,
    toggleLayer,
    handleDistrictClick,
    clearError,
    setOverrideConfirm,
    recheckApi,
  } = useSimulation();

  const nearestShelter = useMemo(() => {
    if (!userLocation || !simulationData?.shelters?.length) return null;
    return getNearestShelter(userLocation.lat, userLocation.lng, simulationData.shelters);
  }, [userLocation, simulationData?.shelters]);
  const nearestShelterId = nearestShelter?.shelter?.id ?? null;

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isLoading) runSimulation();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [runSimulation, isLoading]);

  useEffect(() => {
    let active = true;
    let timer = null;
    const tick = async () => {
      try {
        const res = await getResources();
        if (!active) return;
        setResources(Array.isArray(res) ? res : []);
      } catch {
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
    let active = true;
    let interval = null;
    const load = async () => {
      try {
        const list = await getHospitals();
        if (!active) return;
        setHospitals(Array.isArray(list) ? list : []);
      } catch {}
    };
    load();
    interval = setInterval(load, 30000);
    return () => {
      active = false;
      if (interval) clearInterval(interval);
    };
  }, []);

  const onAssignResources = async () => {
    if (!simulationData) return;
    setAssigning(true);
    try {
      const result = await assignResources({ severity, departure_hour: new Date().getHours() });
      setResourceAssignments(result?.assignments || []);
    } catch {
      setResourceAssignments([]);
    } finally {
      setAssigning(false);
    }
  };

  const handleHumanOverride = useCallback(() => {
    console.info('Human override activated at:', new Date().toISOString());
    alert('Override logged. Human decision-maker is now in control.');
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Emergency mode: SMS-style alert preview */}
      {emergencyMode && (
        <div className="shrink-0 px-4 py-2 bg-slate-800 border-b border-slate-700">
          <p className="text-xs text-slate-500 mb-1">SMS-style alert preview</p>
          <div className="rounded-lg border border-slate-600 bg-slate-900 p-3 text-sm text-slate-200 font-mono max-w-md">
            [Rescue Twin] High risk in your area. Evacuate to nearest shelter. Follow official routes. Reply HELP for info.
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="shrink-0 flex items-center justify-between px-3 sm:px-4 py-2 border-b border-slate-800 bg-slate-900/80 gap-2">
        <h1 className="text-base sm:text-lg font-semibold text-white truncate min-w-0">Simulation · J&amp;K</h1>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {isLoading && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Model running…
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsFullscreenMap((v) => !v)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/80 transition-colors"
            title={isFullscreenMap ? 'Exit fullscreen map' : 'Fullscreen map'}
            aria-label={isFullscreenMap ? 'Exit fullscreen map' : 'Fullscreen map'}
          >
            {isFullscreenMap ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
          {simulationData && (
            <span className="text-xs text-slate-500 hidden sm:inline">
              Last run: {new Date(simulationData.timestamp).toLocaleTimeString()}
            </span>
          )}
          <span className="text-xs text-slate-600 hidden md:inline" title="Run simulation">
            Ctrl+Enter
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                backendStatus === 'online'
                  ? 'bg-emerald-500'
                  : backendStatus === 'offline'
                  ? 'bg-red-500'
                  : 'bg-amber-500 animate-pulse'
              }`}
              aria-hidden
            />
            <span className="text-xs text-slate-500">
              {backendStatus === 'online' ? 'API online' : backendStatus === 'offline' ? 'API offline' : 'Checking…'}
            </span>
            {backendStatus === 'offline' && (
              <button type="button" onClick={() => recheckApi()} className="text-xs text-sky-400 hover:text-sky-300 underline">
                Recheck
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="shrink-0 flex items-center gap-2 px-4 py-2 bg-red-950/80 border-b border-red-900/50 text-red-200 text-sm">
          <svg className="w-5 h-5 shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="flex-1">{error}</span>
          <button type="button" onClick={clearError} className="p-1 rounded hover:bg-red-900/50 transition-colors" aria-label="Dismiss error">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className={`flex-1 flex min-h-0 flex-col md:flex-row ${isFullscreenMap ? 'md:flex-row' : ''}`}>
        <div className={`flex-1 min-h-[45vh] md:min-h-0 min-w-0 p-2 sm:p-4 ${isFullscreenMap ? 'md:p-2' : ''}`}>
          <div className="h-full min-h-[280px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900/50">
            <MapComponent
              simulationData={simulationData}
              layers={layers}
              isLoading={isLoading}
              selectedDistrict={selectedDistrict}
              onDistrictClick={handleDistrictClick}
              userLocation={userLocation}
              nearestShelterId={nearestShelterId}
              hospitals={hospitals}
              highlightedRouteKey={highlightedRouteKey}
              resources={resources}
              resourceAssignments={resourceAssignments}
            />
          </div>
        </div>
        <aside className={`shrink-0 flex flex-col gap-4 md:overflow-y-auto bg-slate-900/30 transition-all
          ${isFullscreenMap ? 'w-0 p-0 overflow-hidden border-0' : 'w-full md:w-[380px] p-4 md:pl-0 md:border-l border-slate-800/50'}`}>
          <LocationSafetyPanel
            position={userLocation}
            error={locationError}
            loading={locationLoading}
            onRequestLocation={requestLocation}
            simulationData={simulationData}
          />
          <RoutesPanel
            simulationData={simulationData}
            selectedDistrict={selectedDistrict}
            highlightedRouteKey={highlightedRouteKey}
            onHighlightRoute={setHighlightedRouteKey}
          />
          <AmbulancesPanel simulationData={simulationData} resourceAssignments={resourceAssignments} />
          <ControlPanel
            disasterType={disasterType}
            onDisasterTypeChange={setDisasterType}
            onRunSimulation={runSimulation}
            onRunDemo={runDemo}
            isLoading={isLoading}
            layers={layers}
            onLayerToggle={toggleLayer}
            severity={severity}
            onSeverityChange={setSeverity}
            rainfallOverride={rainfallOverride}
            onRainfallChange={setRainfallOverride}
            magnitude={magnitude}
            onMagnitudeChange={setMagnitude}
            epicenter={epicenter}
            onEpicenterChange={setEpicenter}
            onAssignResources={onAssignResources}
            assigning={assigning}
          />
          <DecisionPanel
            simulationData={simulationData}
            onHumanOverride={handleHumanOverride}
            showOverrideConfirm={showOverrideConfirm}
            setShowOverrideConfirm={setOverrideConfirm}
          />
        </aside>
      </div>
    </div>
  );
}
