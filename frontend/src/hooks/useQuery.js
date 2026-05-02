import { useState, useEffect, useRef, useCallback } from 'react';
import { getCached, setCache, invalidateCache } from '../services/queryCache';

/**
 * useQuery — Lightweight data-fetching hook with built-in caching.
 *
 * Features:
 * - Stale-while-revalidate: shows cached data instantly, then refreshes in background
 * - Prevents duplicate fetches for the same key
 * - Auto-deduplicates concurrent requests
 * - Supports manual refetch and cache invalidation
 *
 * @param {string} key       - Unique cache key (e.g. 'events', 'admin-stats')
 * @param {Function} fetcher - Async function that returns the data
 * @param {Object} options
 * @param {number}  options.staleTime  - Milliseconds before data is considered stale (default 30s)
 * @param {boolean} options.enabled    - Set to false to disable auto-fetching (default true)
 * @param {any[]}   options.deps       - Extra dependencies that trigger a re-fetch when changed
 */
export function useQuery(key, fetcher, options = {}) {
  const {
    staleTime = 30000,
    enabled = true,
    deps = [],
  } = options;

  const [data, setData] = useState(() => {
    // Initialize from cache if available
    const cached = getCached(key);
    return cached ? cached.data : null;
  });
  const [loading, setLoading] = useState(() => {
    const cached = getCached(key);
    return !cached; // Only show loading if no cache exists
  });
  const [error, setError] = useState(null);
  const inflightRef = useRef(null);

  const fetchData = useCallback(async ({ showLoading = false } = {}) => {
    // Don't duplicate in-flight requests
    if (inflightRef.current) return inflightRef.current;

    if (showLoading) setLoading(true);

    const promise = (async () => {
      try {
        const result = await fetcher();
        setData(result);
        setCache(key, result, staleTime);
        setError(null);
        return result;
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Request failed');
        throw err;
      } finally {
        setLoading(false);
        inflightRef.current = null;
      }
    })();

    inflightRef.current = promise;
    return promise;
  }, [key, fetcher, staleTime]);

  // Auto-fetch on mount / dependency change
  useEffect(() => {
    if (!enabled) return;

    const cached = getCached(key);

    if (cached && !cached.isStale) {
      // Cache is fresh — use it, no network request
      setData(cached.data);
      setLoading(false);
      return;
    }

    if (cached && cached.isStale) {
      // Cache exists but stale — show it immediately, refresh in background
      setData(cached.data);
      setLoading(false);
      fetchData(); // Silent background refresh
      return;
    }

    // No cache — fetch with loading indicator
    fetchData({ showLoading: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled, ...deps]);

  /**
   * Force a refetch (e.g., after a mutation).
   */
  const refetch = useCallback(() => {
    invalidateCache(key);
    return fetchData({ showLoading: false });
  }, [key, fetchData]);

  /**
   * Optimistically update the cached data without a network request.
   */
  const setOptimistic = useCallback((updater) => {
    setData(prev => {
      const updated = typeof updater === 'function' ? updater(prev) : updater;
      setCache(key, updated, staleTime);
      return updated;
    });
  }, [key, staleTime]);

  return { data, loading, error, refetch, setOptimistic };
}
