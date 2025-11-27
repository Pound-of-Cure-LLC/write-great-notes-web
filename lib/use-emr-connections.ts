/**
 * EMR Connections SWR Hook
 *
 * Simplified hook that returns raw SWR response with helper utilities.
 * Features: auto-caching, deduplication, auto-revalidation.
 */

import useSWR from 'swr';
import { apiGet } from './api-client';

export interface EMRConnection {
  id: string;
  emr_type: string;
  connection_status: string;
}

const fetcher = async (url: string): Promise<EMRConnection[]> => {
  return apiGet<EMRConnection[]>(url);
};

/**
 * Fetch and cache EMR connections
 *
 * @returns Standard SWR response: { data, error, isLoading, mutate }
 */
export function useEMRConnections() {
  return useSWR<EMRConnection[]>('/emr-connections', fetcher, {
    revalidateOnMount: true,
    dedupingInterval: 2000,
  });
}

/**
 * Check if specific EMR type has active connection
 */
export function hasActiveConnection(connections: EMRConnection[] | undefined, emrType?: string): boolean {
  if (!connections) return false;
  if (emrType) {
    return connections.some(conn => conn.emr_type === emrType && conn.connection_status === 'active');
  }
  return connections.some(conn => conn.connection_status === 'active');
}

/**
 * Check if Charm EMR is connected
 */
export function useHasCharmConnection(): boolean {
  const { data } = useEMRConnections();
  return hasActiveConnection(data, 'charm');
}
