'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useCapabilitiesStore } from '@/store/capabilitiesStore';

/**
 * Invisible component that fetches capabilities once when user is authenticated.
 * Add this to any authenticated page/layout to ensure capabilities are loaded.
 *
 * This component:
 * 1. Listens for SIGNED_IN events
 * 2. Fetches capabilities once and stores them in Zustand
 * 3. Does NOT interfere with the auth flow
 * 4. Renders nothing (invisible)
 */
export function CapabilitiesFetcher() {
  const fetchCapabilities = useCapabilitiesStore((state) => state.fetchCapabilities);
  const capabilities = useCapabilitiesStore((state) => state.capabilities);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    // Only listen for SIGNED_IN events to fetch capabilities
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        // Fetch capabilities when user signs in (and we don't have them yet)
        if (event === 'SIGNED_IN' && session && !capabilities) {
          // Small delay to ensure cookies are fully set
          setTimeout(() => {
            if (mounted) {
              fetchCapabilities();
            }
          }, 300);
        }
      }
    );

    // Also check if already authenticated (on page load)
    const initializeCapabilities = async () => {
      // Only fetch if we don't already have capabilities
      if (capabilities) return;

      const { data: { session } } = await supabase.auth.getSession();

      if (session && mounted) {
        setTimeout(() => {
          if (mounted) {
            fetchCapabilities();
          }
        }, 300);
      }
    };

    initializeCapabilities();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchCapabilities, capabilities]);

  // Render nothing - this is an invisible side-effect component
  return null;
}
