'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useCapabilitiesStore } from '@/store/capabilitiesStore';
import { createClient } from '@/lib/supabase/client';

import { logger } from "@/lib/logger";
/**
 * Provider component that fetches capabilities on mount
 * when user is authenticated.
 */
export function CapabilitiesProvider({ children }: { children: React.ReactNode }) {
  const fetchCapabilities = useCapabilitiesStore((state) => state.fetchCapabilities);
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    // Skip fetching capabilities on certain pages where user may not have full access yet
    const skipCapabilitiesPaths = ['/accept-invite', '/onboarding'];
    const shouldSkip = skipCapabilitiesPaths.some(path => pathname?.startsWith(path));

    if (shouldSkip) {
      logger.debug('CapabilitiesProvider: Skipping capabilities fetch on', pathname);
      return;
    }

    // Listen for auth state changes FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session) {
          // Wait a bit to ensure auth cookies are set
          await new Promise(resolve => setTimeout(resolve, 200));
          if (mounted) {
            await fetchCapabilities();
          }
        }
      }
    );

    // Then check if already authenticated
    const initializeCapabilities = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session && mounted) {
        // Wait a bit to ensure auth cookies are set
        await new Promise(resolve => setTimeout(resolve, 200));
        if (mounted) {
          await fetchCapabilities();
        }
      }
    };

    initializeCapabilities();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchCapabilities, pathname]);

  return <>{children}</>;
}
