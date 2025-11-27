/**
 * Appointments SWR Hook with Simple LRU Cache
 *
 * Features:
 * - On-demand loading: Cache appointments when user views a date
 * - LRU eviction: Keep max 10 dates, evict least recently used
 * - Auto-refresh: Current date silently updates every 60 seconds
 */

import { useEffect } from "react";
import useSWR, { useSWRConfig } from "swr";
import { apiGet } from "./api-client";

export interface AppointmentViewModel {
  id: string;
  appointment_datetime: string;
  duration_minutes: number;
  status: string;
  appointment_details?: string | null;
  provider_id?: string;
  location_id?: string | null;
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    mrn?: string | null;
    full_name?: string | null;
  };
  visit_type?: {
    id: string | null;
    name: string;
  } | null;
  transcription_status?: {
    status:
      | "not_recorded"
      | "recording"
      | "recorded"
      | "processing"
      | "completed"
      | "failed"
      | "pushed_to_emr"
      | "signed";
    transcription_id?: string | null;
    note_id?: string | null;
    error_message?: string | null;
    started_at?: string | null;
  };
}

/**
 * Normalize date to local midnight to prevent timezone issues
 *
 * CRITICAL: Date objects with time components can cause cache mismatches.
 * Example: new Date("2025-11-02") creates UTC midnight, which is Nov 1 in EST.
 * This function ensures all dates are at local midnight.
 */
function normalizeToLocalMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Format date as YYYY-MM-DD using local timezone
 *
 * IMPORTANT: Uses local date components to ensure cache key matches display.
 */
function formatDate(date: Date): string {
  const normalized = normalizeToLocalMidnight(date);
  const year = normalized.getFullYear();
  const month = String(normalized.getMonth() + 1).padStart(2, "0");
  const day = String(normalized.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * LRU Cache Manager for Appointments
 *
 * Tracks access order and evicts least recently used dates when cache exceeds 10 dates.
 * Each filter combination (provider_ids + location_ids) has its own LRU tracking.
 */
class AppointmentsLRUCache {
  private accessOrder = new Map<string, number>(); // key -> timestamp
  private maxDates = 10;

  /**
   * Record access to a cache key
   */
  recordAccess(key: string): void {
    this.accessOrder.set(key, Date.now());
  }

  /**
   * Evict oldest cache entries if we exceed maxDates
   * Returns array of keys to delete
   */
  evictIfNeeded(
    cache: { keys: () => IterableIterator<any>; delete: (key: string) => void },
    providerIds: string[],
    locationIds: string[]
  ): void {
    const providers = providerIds.sort().join(",");
    const locations = locationIds.sort().join(",");
    const filterSuffix = `&provider_ids=${providers}&location_ids=${locations}`;

    // Get all keys matching current filter
    const matchingKeys: string[] = [];
    Array.from(cache.keys()).forEach((key) => {
      if (
        typeof key === "string" &&
        key.startsWith("/appointments?") &&
        key.endsWith(filterSuffix)
      ) {
        matchingKeys.push(key);
      }
    });

    // If we're under the limit, nothing to evict
    if (matchingKeys.length <= this.maxDates) {
      return;
    }

    // Sort by access time (oldest first)
    const sorted = matchingKeys
      .map((key) => ({ key, accessTime: this.accessOrder.get(key) || 0 }))
      .sort((a, b) => a.accessTime - b.accessTime);

    // Evict oldest entries
    const toEvict = sorted.slice(0, matchingKeys.length - this.maxDates);
    toEvict.forEach(({ key }) => {
      cache.delete(key);
      this.accessOrder.delete(key);
    });
  }
}

// Global LRU cache instance
const lruCache = new AppointmentsLRUCache();

/**
 * Generate SWR cache key
 *
 * IMPORTANT: Cache key must match the actual API endpoint format EXACTLY
 * to ensure proper cache hits/misses
 */
export function getAppointmentsKey(
  date: Date,
  providerIds: string[],
  locationIds: string[]
): string {
  const dateStr = formatDate(date);
  const providers = providerIds.sort().join(",");
  const locations = locationIds.sort().join(",");
  return `/appointments?start_date=${dateStr}&end_date=${dateStr}&provider_ids=${providers}&location_ids=${locations}`;
}

/**
 * Fetch appointments for a single date
 */
async function fetchAppointments(
  date: Date,
  providerIds: string[],
  locationIds: string[]
): Promise<AppointmentViewModel[]> {
  const params = new URLSearchParams({
    start_date: formatDate(date),
    end_date: formatDate(date),
  });

  if (providerIds.length > 0) {
    params.append("provider_ids", providerIds.join(","));
  }

  if (locationIds.length > 0) {
    params.append("location_ids", locationIds.join(","));
  }

  const response = await apiGet<{ appointments: AppointmentViewModel[] }>(
    `/appointments?${params.toString()}`
  );

  return response.appointments;
}

/**
 * Fetch and cache appointments for a specific date
 *
 * Features:
 * - On-demand caching: Only fetches when user views a date
 * - LRU eviction: Automatically removes oldest cached dates when exceeding 10 dates
 * - Auto-refresh: Silently revalidates every 60 seconds
 * - Conditional fetching: Suspends until filters are initialized to prevent cache key mismatches
 *
 * @returns Standard SWR response: { data, error, isLoading, mutate }
 */
export function useAppointments(
  date: Date,
  providerIds: string[],
  locationIds: string[]
) {
  // Suspend fetching until filters are initialized (prevents cache key mismatches)
  const filtersReady = providerIds.length > 0 && locationIds.length > 0;
  const key = filtersReady
    ? getAppointmentsKey(date, providerIds, locationIds)
    : null;
  const { cache } = useSWRConfig();

  // Record access for LRU tracking (only when key is defined)
  useEffect(() => {
    if (key) {
      lruCache.recordAccess(key);
    }
  }, [key]);

  // Evict old cache entries if needed (only when filters are ready)
  useEffect(() => {
    if (filtersReady) {
      lruCache.evictIfNeeded(cache, providerIds, locationIds);
    }
  }, [cache, providerIds, locationIds, filtersReady]);

  return useSWR<AppointmentViewModel[]>(
    key, // null = don't fetch yet
    () => fetchAppointments(date, providerIds, locationIds),
    {
      refreshInterval: 60000, // Auto-refresh every 60 seconds (silent background update)
      dedupingInterval: 2000, // Prevent duplicate requests within 2 seconds
      revalidateIfStale: true, // Fetch if cache is stale
      revalidateOnFocus: true, // Refetch on window focus to pick up new transcriptions
      revalidateOnReconnect: false, // Don't refetch on network reconnect
      keepPreviousData: true, // Keep showing previous data while loading
    }
  );
}
