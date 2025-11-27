'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { apiClient } from '@/lib/api-client'
import { logger } from "@/lib/logger";

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true

    const handleAuthCallback = async () => {
      // Check for auth tokens in URL hash (from email confirmation)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      logger.debug('Auth callback: Checking for auth tokens in URL hash')
      logger.debug('Access token present:', !!accessToken)
      logger.debug('Refresh token present:', !!refreshToken)

      if (accessToken && refreshToken) {
        logger.debug('Auth callback: Setting session from URL tokens')

        // Set the session from the tokens
        const { data: { session }, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (error) {
          logger.error('Auth callback: Error setting session:', error)
          if (isMounted) router.push('/login')
          return
        }

        if (session) {
          logger.debug('Auth callback: Session established successfully')
          logger.debug('Auth callback: User ID:', session.user.id)

          // Wait a moment for session to be fully established
          await new Promise(resolve => setTimeout(resolve, 100))

          // Now check user profile
          if (isMounted) {
            await checkUserAndRedirect()
          }
        }
      } else {
        logger.debug('Auth callback: No auth tokens in URL, checking existing session')
        // No auth callback - check if user is already logged in
        const { data } = await supabase.auth.getClaims()
        const user = data?.claims

        if (user) {
          logger.debug('Auth callback: Existing session found, checking user profile')
          if (isMounted) {
            await checkUserAndRedirect()
          }
        } else {
          logger.debug('Auth callback: No session found, redirecting to login')
          if (isMounted) router.push('/login')
        }
      }
    }

    const checkUserAndRedirect = async () => {
      try {
        logger.debug('Auth callback: Checking user profile at /users/me')
        const response = await apiClient('/users/me')

        logger.debug('Auth callback: User profile check response status:', response.status)

        if (!response.ok) {
          logger.error('Auth callback: Failed to fetch user profile:', response.status)
          router.push('/login')
          return
        }

        // Check if user has completed onboarding (has organization_id)
        const userData = await response.json()
        logger.debug('Auth callback: User data:', userData)

        if (!userData.organization_id) {
          logger.debug('Auth callback: User has no organization - redirecting to /onboarding/setup')
          router.push('/onboarding/setup')
        } else {
          logger.debug('Auth callback: User has organization - redirecting to /appointments')
          router.push('/appointments')
        }
      } catch (error) {
        logger.error('Auth callback: Error checking user profile:', error)
        router.push('/login')
      }
    }

    handleAuthCallback()

    return () => {
      isMounted = false
    }
  }, [router])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Write Great Notes</h1>
        <p className="text-xl text-muted-foreground">
          Verifying your account...
        </p>
      </div>
    </main>
  )
}
