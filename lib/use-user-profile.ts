/**
 * User Profile SWR Hook
 *
 * Simplified hook that returns raw SWR response.
 * Features: auto-caching, deduplication, auto-revalidation.
 */

import useSWR from 'swr';
import { apiGet } from './api-client';

export interface UserProfile {
  uid: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  npi: string | null;
  degree: string | null;
  user_note_instructions: string | null;
  emr_settings: {
    charm_post_generation_action?: string;
  };
  roles: string[];
  allowed_visit_types: string[];
  default_visit_type: string | null;
  organization_id: string | null;
  has_pending_invitation: boolean;
}

const fetcher = async (url: string): Promise<UserProfile> => {
  return apiGet<UserProfile>(url);
};

/**
 * Fetch and cache user profile
 *
 * @param skip - Skip fetching (for login/signup pages)
 * @returns Standard SWR response: { data, error, isLoading, mutate }
 */
export function useUserProfile(skip = false) {
  return useSWR<UserProfile>(
    skip ? null : '/users/me',
    fetcher,
    {
      // Always fetch on mount to ensure we have fresh data after login
      revalidateOnMount: true,
      dedupingInterval: 60000,
    }
  );
}

/**
 * Check if user has a specific role
 */
export function useHasRole(role: string): boolean {
  const { data } = useUserProfile();
  return data?.roles.includes(role) ?? false;
}

/**
 * Check if user is a provider
 */
export function useIsProvider(): boolean {
  return useHasRole('provider');
}
