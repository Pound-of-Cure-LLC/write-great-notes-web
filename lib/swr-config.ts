/**
 * Global SWR Configuration with localStorage persistence
 *
 * Features:
 * - localStorage persistence across sessions
 * - Cache versioning to handle schema changes
 * - Auto-revalidation on focus/reconnect
 * - Request deduplication
 * - Error recovery
 */

import { SWRConfiguration } from 'swr';

import { logger } from "@/lib/logger";
const CACHE_VERSION = 1;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: number;
}

/**
 * LocalStorage provider for SWR
 * Handles persistence, versioning, and error recovery
 */
function localStorageProvider() {
  // Load cache from localStorage and restore as SWR-compatible format
  let initialCache: Array<[string, any]> = [];

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('swr-cache');
      if (stored) {
        const parsed = JSON.parse(stored) as Array<[string, { data: any; timestamp: number }]>;
        // Convert stored format back to SWR format
        initialCache = parsed.map(([key, value]) => [key, value]);
        logger.debug('[SWR] Restored cache from localStorage:', initialCache.length, 'entries');
      }
    } catch (error) {
      logger.error('[SWR] Failed to restore cache:', error);
    }
  }

  const map = new Map<string, any>(initialCache);

  // Validate cache version on load
  if (typeof window !== 'undefined') {
    const storedVersion = localStorage.getItem('swr-cache-version');
    if (storedVersion !== String(CACHE_VERSION)) {
      logger.info('SWR cache version mismatch, clearing cache');
      localStorage.removeItem('swr-cache');
      localStorage.setItem('swr-cache-version', String(CACHE_VERSION));
      map.clear();
    }

    // Clean up orphaned cache keys from old implementation
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('appointments:') || key === 'lastScheduleDate') {
        logger.info('Removing orphaned cache key:', key);
        localStorage.removeItem(key);
      }
    });
  }

  // Persist to localStorage with multiple triggers
  if (typeof window !== 'undefined') {
    let persistTimeout: NodeJS.Timeout | null = null;

    const persistCache = () => {
      try {
        // Extract only serializable data from SWR cache entries
        const appCache = Array.from(map.entries())
          .filter(([key, value]) => {
            // Only persist keys that have actual data
            return value && typeof value.data !== 'undefined' && value.data !== null;
          })
          .map(([key, value]) => {
            // Store only the data, not the entire SWR state object
            return [key, {
              data: value.data,
              timestamp: Date.now(),
            }];
          });

        localStorage.setItem('swr-cache', JSON.stringify(appCache));
        logger.debug('[SWR] Cache persisted:', appCache.length, 'entries');
      } catch (error) {
        logger.error('[SWR] Failed to persist cache:', error);
      }
    };

    // Debounced persistence function
    const debouncedPersist = () => {
      if (persistTimeout) clearTimeout(persistTimeout);
      persistTimeout = setTimeout(persistCache, 1000); // Wait 1s after last change
    };

    // Wrap Map methods to trigger persistence
    const originalSet = map.set.bind(map);
    const originalDelete = map.delete.bind(map);
    const originalClear = map.clear.bind(map);

    map.set = (key, value) => {
      const result = originalSet(key, value);
      logger.debug('[SWR] Cache set:', key.substring(0, 80), 'has data:', !!value?.data);
      debouncedPersist();
      return result;
    };

    map.delete = (key) => {
      const result = originalDelete(key);
      debouncedPersist();
      return result;
    };

    map.clear = () => {
      originalClear();
      persistCache(); // Immediate persist on clear
    };

    // Persist on page visibility change (when user switches tabs)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        persistCache();
      }
    });

    // Persist on beforeunload (tab close) as backup
    window.addEventListener('beforeunload', persistCache);

    // Persist periodically in case other triggers fail
    setInterval(persistCache, 30000); // Every 30 seconds
  }

  return map;
}

/**
 * Global SWR configuration
 */
export const swrConfig: SWRConfiguration = {
  provider: localStorageProvider,

  // Auto-revalidation settings
  revalidateOnFocus: true,          // Refresh when tab gains focus
  revalidateOnReconnect: true,      // Refresh when network reconnects
  dedupingInterval: 2000,           // Dedupe requests within 2s

  // Error handling
  shouldRetryOnError: true,         // Retry on error
  errorRetryCount: 3,               // Max 3 retries
  errorRetryInterval: 5000,         // 5s between retries

  // Cache settings
  revalidateIfStale: true,          // Revalidate stale data
  focusThrottleInterval: 5000,      // Throttle focus revalidation to 5s
};

/**
 * Clear all SWR cache
 * Call this on logout to prevent data leaks
 */
export function clearSWRCache() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('swr-cache');
    localStorage.setItem('swr-cache-version', String(CACHE_VERSION));
  }
}
