'use client';

import { useState, useEffect, useCallback } from 'react';
import { simulateFlood, simulateEarthquake, checkHealth } from '../services/api';

const DEFAULT_LAYERS = {
  floodZones: true,
  routes: true,
  shelters: true,
  vulnerability: false,
};

export function useSimulation() {
  const [simulationData, setSimulationData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [disasterType, setDisasterType] = useState('flood');
  const [severity, setSeverity] = useState('medium');
  const [rainfallOverride, setRainfallOverride] = useState(null);
  const [magnitude, setMagnitude] = useState(6);
  const [epicenter, setEpicenter] = useState('d1');
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [highlightedRouteKey, setHighlightedRouteKey] = useState(null);
  const [showOverrideConfirm, setShowOverrideConfirm] = useState(false);
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [backendStatus, setBackendStatus] = useState('checking');

  const checkBackend = useCallback(async () => {
    try {
      await checkHealth();
      setBackendStatus('online');
      return true;
    } catch {
      setBackendStatus('offline');
      return false;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (await checkBackend()) return;
      for (const delay of [2000, 3000]) {
        if (cancelled) return;
        await new Promise((r) => setTimeout(r, delay));
        if (cancelled) return;
        if (await checkBackend()) return;
      }
    };
    run();
    return () => { cancelled = true; };
  }, [checkBackend]);

  const runSimulation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (disasterType === 'earthquake') {
        const result = await simulateEarthquake(magnitude, epicenter);
        setSimulationData(result);
        saveLastRunToStorage('earthquake', { magnitude, epicenter: result?.epicenter_district_name || epicenter }, result);
      } else {
        const result = await simulateFlood(severity, rainfallOverride);
        setSimulationData(result);
        saveLastRunToStorage('flood', { severity, rainfall: result?.rainfall_intensity }, result);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [disasterType, severity, rainfallOverride, magnitude, epicenter]);

  function saveLastRunToStorage(type, params, result) {
    try {
      const summary = result?.risk_metrics
        ? `${(result.risk_metrics.high_risk_zones || 0) + (result.risk_metrics.medium_risk_zones || 0)} zones, ${(result.risk_metrics.total_population_at_risk || 0).toLocaleString()} at risk`
        : type === 'earthquake'
          ? `Magnitude ${params.magnitude}, epicenter ${params.epicenter}`
          : `${params.severity} severity`;
      localStorage.setItem(
        'rescue-twin-last-run',
        JSON.stringify({
          type,
          params: type === 'flood' ? { severity: params.severity } : { magnitude: params.magnitude, epicenter: params.epicenter },
          summary,
          timestamp: Date.now(),
        })
      );
    } catch (e) {
      /* ignore */
    }
  }

  const runDemo = useCallback(async () => {
    if (disasterType === 'earthquake') {
      setMagnitude(6.5);
      setEpicenter('d1');
      setIsLoading(true);
      setError(null);
      try {
        const result = await simulateEarthquake(6.5, 'd1');
        setSimulationData(result);
        saveLastRunToStorage('earthquake', { magnitude: 6.5, epicenter: result?.epicenter_district_name || 'd1' }, result);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSeverity('high');
      setRainfallOverride(null);
      setIsLoading(true);
      setError(null);
      try {
        const result = await simulateFlood('high', null);
        setSimulationData(result);
        saveLastRunToStorage('flood', { severity: 'high', rainfall: result?.rainfall_intensity }, result);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  }, [disasterType]);

  const toggleLayer = useCallback((layer) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  }, []);

  const handleDistrictClick = useCallback((zone) => {
    setSelectedDistrict(zone?.district_id ?? null);
    setHighlightedRouteKey(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);
  const setOverrideConfirm = useCallback((value) => setShowOverrideConfirm(value), []);

  return {
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
    recheckApi: checkBackend,
  };
}
