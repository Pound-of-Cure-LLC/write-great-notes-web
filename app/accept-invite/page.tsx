'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiPost } from '@/lib/api-client'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { clearAuthRedirectCache } from '@/hooks/useAuthRedirect'

import { logger } from "@/lib/logger";
type PageStatus = 'checking' | 'set-password' | 'processing' | 'success' | 'error'

function AcceptInviteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState<string | null>(null)

  const [status, setStatus] = useState<PageStatus>('checking')
  const [errorMessage, setErrorMessage] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Check if user has authenticated session on mount
  useEffect(() => {
    const supabase = createClient();
    let isMounted = true

    const checkSession = async () => {
      logger.debug('Accept invite: Starting session check')
      logger.debug('Accept invite: Full URL:', window.location.href)
      logger.debug('Accept invite: Hash:', window.location.hash)

      // Check for auth tokens in URL hash (from email confirmation link)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      logger.debug('Accept invite: Access token present:', !!accessToken)
      logger.debug('Accept invite: Refresh token present:', !!refreshToken)

      try {
        if (accessToken && refreshToken) {
          logger.debug('Accept invite: Setting session from URL tokens')
          // Set the session from the tokens
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (error || !session) {
            logger.error('Accept invite: Error setting session:', error)
            setStatus('error')
            setErrorMessage('Failed to establish authentication session')
            return
          }

          logger.debug('Accept invite: Session established successfully')
          // Wait a moment for session to be fully established
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        // Get current session
        logger.debug('Accept invite: Getting current session')
        const { data: { session } } = await supabase.auth.getSession()
        logger.debug('Accept invite: Current session:', !!session)

        if (!session) {
          logger.error('Accept invite: No session found')
          setStatus('error')
          setErrorMessage('No authentication session found. Please click the link in your invitation email.')
          return
        }

        // Get user and extract invitation token from metadata
        logger.debug('Accept invite: Getting user data')
        const { data: { user } } = await supabase.auth.getUser()
        logger.debug('Accept invite: User data:', user ? 'present' : 'missing')

        if (!user) {
          logger.error('Accept invite: No user data')
          setStatus('error')
          setErrorMessage('Unable to retrieve user information')
          return
        }

        // Get invitation token from user metadata
        const invitationToken = user.user_metadata?.invitation_token
        logger.debug('Accept invite: Invitation token from metadata:', invitationToken ? 'present' : 'missing')
        logger.debug('Accept invite: User metadata:', user.user_metadata)

        if (!invitationToken) {
          logger.error('Accept invite: No invitation token in user metadata')
          setStatus('error')
          setErrorMessage('No invitation token found. This link may be invalid.')
          return
        }

        // Store the invitation token
        logger.debug('Accept invite: Setting token and moving to set-password state')
        if (isMounted) {
          setToken(invitationToken)
          setStatus('set-password')
        }

      } catch (err: any) {
        logger.error('Failed to check session:', err)
        if (isMounted) {
          setStatus('error')
          setErrorMessage(err.message || 'Failed to verify invitation')
        }
      }
    }

    checkSession()

    return () => {
      isMounted = false
    }
  }, []) // Run only once on mount

  const handleSetPassword = async (e: React.FormEvent) => {
    const supabase = createClient();
    e.preventDefault()
    setPasswordError('')

    // Validate password
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    setStatus('processing')

    try {
      // Update the user's password
      const { error: passwordError } = await supabase.auth.updateUser({
        password: password
      })

      if (passwordError) {
        throw passwordError
      }

      // Now accept the invitation
      await apiPost('/users/accept-invite', { token: token! })

      // Wait a moment for Supabase to propagate the metadata update
      await new Promise(resolve => setTimeout(resolve, 500))

      // Refresh the session to get updated user metadata (invitation_token cleared, roles added)
      // This prevents middleware from redirecting back to accept-invite
      const { data: { session: refreshedSession } } = await supabase.auth.refreshSession()

      if (!refreshedSession) {
        logger.error('Failed to refresh session after invitation acceptance')
      } else {
        logger.debug('Session refreshed successfully, invitation_token cleared')
      }

      // Clear auth redirect cache since user status changed (accepted invitation)
      clearAuthRedirectCache()

      setStatus('success')

      // Redirect to profile settings to complete user profile after 1 second
      setTimeout(() => {
        router.push('/settings/profile')
      }, 1000)

    } catch (err: any) {
      logger.error('Failed to set password or accept invitation:', err)
      setStatus('set-password')
      setPasswordError(err.message || 'Failed to complete setup')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {status === 'checking' && 'Verifying Invitation'}
            {status === 'set-password' && 'Set Your Password'}
            {status === 'processing' && 'Creating Your Account'}
            {status === 'success' && 'Welcome!'}
            {status === 'error' && 'Error'}
          </CardTitle>
          <CardDescription>
            {status === 'checking' && 'Checking your invitation...'}
            {status === 'set-password' && 'Create a password for your account'}
            {status === 'processing' && 'Setting up your profile...'}
            {status === 'success' && 'Your account has been created successfully'}
            {status === 'error' && 'There was a problem with your invitation'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {status === 'checking' && (
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          )}

          {status === 'set-password' && (
            <form onSubmit={handleSetPassword} className="w-full space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password *</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              {passwordError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {passwordError}
                </div>
              )}
              <Button type="submit" className="w-full">
                Create Account
              </Button>
            </form>
          )}

          {status === 'processing' && (
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-600" />
              <p className="text-center text-sm text-muted-foreground">
                Account created successfully! Redirecting you to your profile...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-destructive" />
              <div className="w-full rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                {errorMessage}
              </div>
              <Button onClick={() => router.push('/login')} className="w-full">
                Go to Login
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    }>
      <AcceptInviteContent />
    </Suspense>
  )
}
