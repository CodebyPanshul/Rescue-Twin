'use client';

import { useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useSimulation } from '../../src/hooks/useSimulation';
import ControlPanel from '../../src/components/ControlPanel';
import DecisionPanel from '../../src/components/DecisionPanel';

const MapComponent = dynamic(() => import('./SimulationMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-slate-800/80">
      <div className="text-center">
        <span className="inline-block h-8 w-8 border-2 border-sky-500/30 border-t-sky-400 rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Loading map…</p>
      </div>
    </div>
  ),
});

export default function SimulationPage() {
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

  const handleHumanOverride = useCallback(() => {
    console.info('Human override activated at:', new Date().toISOString());
    alert('Override logged. Human decision-maker is now in control.');
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Toolbar */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/80">
        <h1 className="text-lg font-semibold text-white">Simulation · Jammu &amp; Kashmir</h1>
        <div className="flex items-center gap-2">
          {simulationData && (
            <span className="text-xs text-slate-500 hidden sm:inline">
              Last run: {new Date(simulationData.timestamp).toLocaleTimeString()}
            </span>
          )}
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

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 p-4 min-w-0">
          <div className="h-full rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900/50">
            <MapComponent
              simulationData={simulationData}
              layers={layers}
              isLoading={isLoading}
              selectedDistrict={selectedDistrict}
              onDistrictClick={handleDistrictClick}
            />
          </div>
        </div>
        <aside className="w-[380px] shrink-0 p-4 pl-0 flex flex-col gap-4 overflow-y-auto border-l border-slate-800/50 bg-slate-900/30">
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
