/**
 * Providers and Locations SWR Hooks
 *
 * Caches provider and location lists with SWR for fast subsequent loads.
 * Uses sessionStorage for filter persistence within a session.
 */

import useSWR from 'swr';
import { apiGet } from './api-client';

export interface Provider {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  roles: string[];
}

export interface Location {
  id: string;
  name: string;
  address?: string;
  timezone?: string;
}

/**
 * Fetch and cache providers list
 *
 * SWR caches the response for fast subsequent loads.
 * Aggressive caching: Only refetches if cache is older than 60 minutes.
 */
export function useProviders() {
  return useSWR<Provider[]>(
    '/users',
    async () => {
      const usersData = await apiGet<Provider[]>('/users');
      // Filter to only providers
      return usersData.filter(u => u.roles.includes('provider'));
    },
    {
      dedupingInterval: 3600000, // 60 minutes
      revalidateIfStale: true,    // Fetch if > 60 min old OR no cache
      revalidateOnFocus: false,   // Don't refetch when window regains focus
      revalidateOnReconnect: false, // Don't refetch on network reconnect
    }
  );
}

/**
 * Fetch and cache locations list
 *
 * SWR caches the response for fast subsequent loads.
 * Aggressive caching: Only refetches if cache is older than 60 minutes.
 */
export function useLocations() {
  return useSWR<Location[]>(
    '/locations',
    () => apiGet<Location[]>('/locations'),
    {
      dedupingInterval: 3600000, // 60 minutes
      revalidateIfStale: true,    // Fetch if > 60 min old OR no cache
      revalidateOnFocus: false,   // Don't refetch when window regains focus
      revalidateOnReconnect: false, // Don't refetch on network reconnect
    }
  );
}

