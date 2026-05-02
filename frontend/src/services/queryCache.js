/**
 * Lightweight client-side query cache.
 * 
 * Provides stale-while-revalidate semantics: cached data is returned instantly
 * on re-mount, while a background refresh happens if the data is stale.
 * 
 * This eliminates the re-fetch-on-every-navigation problem without adding
 * a heavy dependency like TanStack Query.
 */

// ── In-memory cache store (persists across navigations, cleared on page reload) ──
const cache = new Map();

/**
 * Get a cached entry.
 * @param {string} key
 * @returns {{ data: any, isStale: boolean } | null}
 */
export function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;

  const isStale = Date.now() - entry.timestamp > entry.ttl;
  return { data: entry.data, isStale };
}

/**
 * Store data in the cache.
 * @param {string} key
 * @param {any} data
 * @param {number} ttlMs - Time-to-live in ms (default 30s)
 */
export function setCache(key, data, ttlMs = 30000) {
  cache.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
}

/**
 * Invalidate cache entries matching a pattern.
 * @param {string} keyPattern - Substring to match against cache keys
 */
export function invalidateCache(keyPattern) {
  for (const key of cache.keys()) {
    if (key.includes(keyPattern)) {
      cache.delete(key);
    }
  }
}

/**
 * Clear the entire cache (e.g., on logout).
 */
export function clearAllCache() {
  cache.clear();
}
