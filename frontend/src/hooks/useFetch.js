'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Generic fetch hook: runs async fetcher when deps change, exposes data, loading, error, refetch.
 * @param {() => Promise<any>} fetcher - Async function (no args; can use closure over deps)
 * @param {Array} deps - Dependency array for when to run (e.g. [scenario])
 * @param {{ initialLoading?: boolean }} options - initialLoading: false = don't show loading until first run
 * @returns {{ data: any, loading: boolean, error: string | null, refetch: () => Promise<void> }}
 */
export function useFetch(fetcher, deps = [], { initialLoading = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!!initialLoading);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.resolve(fetcher())
      .then((result) => { if (!cancelled) setData(result); })
      .catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, deps);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (e) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, deps);

  return { data, loading, error, refetch };
}
