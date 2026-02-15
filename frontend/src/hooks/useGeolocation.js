'use client';

import { useState, useCallback } from 'react';

/**
 * Browser geolocation: position, error, loading, request.
 * @returns {{ position: { lat: number, lng: number } | null, error: string | null, loading: boolean, requestLocation: () => void }}
 */
export function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = useCallback(() => {
    if (typeof window === 'undefined' || !window.navigator?.geolocation) {
      setError('Geolocation is not supported');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    window.navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setError(null);
        setLoading(false);
      },
      (err) => {
        const message =
          err.code === 1
            ? 'Location permission denied'
            : err.code === 2
            ? 'Location unavailable'
            : err.code === 3
            ? 'Location request timed out'
            : err.message || 'Could not get location';
        setError(message);
        setPosition(null);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }, []);

  return { position, error, loading, requestLocation };
}
