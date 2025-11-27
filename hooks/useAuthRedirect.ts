/**
 * Hook to determine where an authenticated user should be redirected
 *
 * Implements the following logic:
 * 1. If user has pending invitation → /accept-invite
 * 2. If user has no organization_id → /onboarding/setup
 * 3. If user has organization_id → provided redirect param or /appointments
 *
 * Uses SWR hook with localStorage cache for instant redirects.
 */

import { useState, useEffect } from 'react'
import { useUserProfile } from '@/lib/use-user-profile'

import { logger } from "@/lib/logger";
const CACHE_KEY = 'auth_redirect_checked'
const CACHE_DURATION_MS = 5 * 60 * 1000 // 5 minutes

interface UseAuthRedirectOptions {
  fallbackPath?: string // Where to go if user has org (default: /appointments)
  skip?: boolean // Skip the redirect check entirely
}

interface UseAuthRedirectResult {
  redirectPath: string | null
  isChecking: boolean
  error: string | null
}

/**
 * Determine where to redirect an authenticated user based on their profile status
 *
 * @param options Configuration options
 * @returns Redirect path, loading state, and error state
 *
 * @example
 * ```tsx
 * // In login form after successful auth
 * const { redirectPath, isChecking } = useAuthRedirect({
 *   fallbackPath: searchParams.get('redirect') || '/appointments'
 * })
 *
 * useEffect(() => {
 *   if (redirectPath && !isChecking) {
 *     router.push(redirectPath)
 *   }
 * }, [redirectPath, isChecking])
 * ```
 */
export function useAuthRedirect(options: UseAuthRedirectOptions = {}): UseAuthRedirectResult {
  const { fallbackPath = '/appointments', skip = false } = options
  const [redirectPath, setRedirectPath] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Use SWR hook for user profile (instant render from cache)
  // Pass skip to prevent fetching on login/signup pages
  const { data: profile, isLoading, error: profileError } = useUserProfile(skip)
  const isChecking = skip ? false : isLoading

  useEffect(() => {
    if (skip || isLoading || !profile) {
      return
    }

    try {
      // Check sessionStorage cache first for 5-minute caching
      const cached = sessionStorage.getItem(CACHE_KEY)
      if (cached) {
        const { timestamp, result } = JSON.parse(cached)
        const age = Date.now() - timestamp

        // Use cached result if less than 5 minutes old
        if (age < CACHE_DURATION_MS) {
          logger.debug('useAuthRedirect: Using cached redirect decision')
          setRedirectPath(result)
          return
        }
      }

      logger.debug('useAuthRedirect: Determining redirect from SWR profile')
      let path: string

      // Priority 1: Pending invitation
      if (profile.has_pending_invitation) {
        logger.debug('useAuthRedirect: User has pending invitation → /accept-invite')
        path = '/accept-invite'
      }
      // Priority 2: No organization (needs onboarding)
      else if (!profile.organization_id) {
        logger.debug('useAuthRedirect: User has no organization → /onboarding/setup')
        path = '/onboarding/setup'
      }
      // Priority 3: Has organization (go to intended destination)
      else {
        logger.debug(`useAuthRedirect: User has organization → ${fallbackPath}`)
        path = fallbackPath
      }

      // Cache the result in sessionStorage
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        result: path
      }))

      setRedirectPath(path)
    } catch (err: any) {
      logger.error('useAuthRedirect: Error determining redirect:', err)
      setError(err.message || 'Failed to determine redirect')
      // On error, default to fallback path
      setRedirectPath(fallbackPath)
    }
  }, [skip, isLoading, profile, fallbackPath])

  // Handle profile fetch errors
  useEffect(() => {
    if (profileError) {
      logger.error('useAuthRedirect: Profile fetch error:', profileError)
      setError(profileError)

      // Prevent redirect loops - never redirect to auth pages
      const safeRedirect = ['/login', '/signup'].includes(fallbackPath)
        ? '/appointments'
        : fallbackPath

      setRedirectPath(safeRedirect)
    }
  }, [profileError, fallbackPath])

  return { redirectPath, isChecking, error }
}

/**
 * Clear the cached redirect decision
 * Call this after:
 * - User accepts an invitation
 * - User completes onboarding
 * - User's organization status changes
 */
export function clearAuthRedirectCache() {
  sessionStorage.removeItem(CACHE_KEY)
  logger.debug('useAuthRedirect: Cache cleared')
}
