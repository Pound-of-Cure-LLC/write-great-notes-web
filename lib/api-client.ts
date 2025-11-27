/**
 * API Client with automatic authentication handling
 *
 * This utility wraps fetch() to automatically include authentication headers
 * from the current Supabase session. Use this instead of raw fetch() for all
 * backend API calls.
 *
 * Simplified approach:
 * 1. Get session from Supabase
 * 2. Use access token
 * 3. If 401, redirect to login
 * 4. Trust Supabase session management - no manual fallbacks
 */

import { createClient } from '@/lib/supabase/client'

import { logger } from "@/lib/logger";
// Use empty string to make requests relative (proxied through Next.js)
// In production, set NEXT_PUBLIC_API_URL to the full backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

interface ApiRequestOptions extends RequestInit {
  requireAuth?: boolean // Default: true
  accessToken?: string // Optional: Use this token instead of fetching from session
  suppressEMRModal?: boolean // Optional: Suppress EMR configuration modal for 503 errors
}

interface ApiResponse<T = unknown> {
  data?: T
  error?: string
}


/**
 * Make an authenticated API request
 *
 * @param endpoint - API endpoint (e.g., '/users/me')
 * @param options - Standard fetch options
 * @returns Response from the API
 *
 * @example
 * ```typescript
 * // GET request
 * const response = await apiClient('/users/me')
 *
 * // POST request
 * const response = await apiClient('/organizations', {
 *   method: 'POST',
 *   body: JSON.stringify({ name: 'My Clinic' })
 * })
 * ```
 */
export async function apiClient<T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<Response> {
  const supabase = createClient()

  // Use getClaims() to get the current user's claims
  // This is the recommended approach from Supabase SSR documentation
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  if (!claims) {
    // No valid session - redirect to login
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname
      // Prevent redirect loops - never redirect to /login with redirect=/login
      const shouldIncludeRedirect = currentPath !== '/login' && currentPath !== '/signup'
      const redirectParam = shouldIncludeRedirect ? `?redirect=${encodeURIComponent(currentPath)}` : ''
      window.location.href = `/login${redirectParam}`
    }
    throw new Error('Not authenticated')
  }

  // Get the access token from the session
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.access_token) {
    // Session exists but no access token - shouldn't happen, but handle it
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname
      // Prevent redirect loops - never redirect to /login with redirect=/login
      const shouldIncludeRedirect = currentPath !== '/login' && currentPath !== '/signup'
      const redirectParam = shouldIncludeRedirect ? `?redirect=${encodeURIComponent(currentPath)}` : ''
      window.location.href = `/login${redirectParam}`
    }
    throw new Error('No session token')
  }

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  }

  // Add timezone header automatically (browser's timezone)
  if (typeof window !== 'undefined') {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      headers['X-Timezone'] = timezone
    } catch (error) {
      logger.warn('API Client: Failed to get timezone:', error)
    }
  }

  // Add any existing headers
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers[key] = value
      }
    })
  }

  // Make the request
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Handle 401 Unauthorized - clear session and redirect to login
  if (response.status === 401) {
    await supabase.auth.signOut()

    if (typeof window !== 'undefined') {
      // Store error message for login page to display
      sessionStorage.setItem('auth_error', 'Your session has expired. Please log in again.')

      const currentPath = window.location.pathname
      // Prevent redirect loops - never redirect to /login with redirect=/login
      const shouldIncludeRedirect = currentPath !== '/login' && currentPath !== '/signup'
      const redirectParam = shouldIncludeRedirect ? `?redirect=${encodeURIComponent(currentPath)}` : ''
      window.location.href = `/login${redirectParam}`
    }
  }

  // Handle 403 Forbidden - check if it's organization_required
  if (response.status === 403) {
    // Clone response so we can read it without consuming it
    const clonedResponse = response.clone()

    try {
      const errorData = await clonedResponse.json()

      // If user is authenticated but missing organization, redirect to onboarding
      if (errorData.error === 'organization_required') {
        if (typeof window !== 'undefined') {
          window.location.href = '/onboarding/setup'
        }
      }
    } catch {
      // If we can't parse the response, just continue
      // The calling code will handle the 403 error
    }
  }

  // Handle 503 Service Unavailable - check if it's an EMR configuration error
  if (response.status === 503) {
    // Clone response so we can read it without consuming it
    const clonedResponse = response.clone()

    try {
      const errorData = await clonedResponse.json()

      // If it's an EMR configuration error, dispatch event to show modal
      // UNLESS this specific request wants to suppress it
      if (errorData.error === 'emr_configuration_error') {
        if (typeof window !== 'undefined' && !options.suppressEMRModal) {
          // Store error details in sessionStorage for modal to retrieve
          sessionStorage.setItem('emr_config_error', JSON.stringify({
            message: errorData.message,
            redirect_url: errorData.redirect_url || '/settings/emr-connections',
            connection_name: errorData.connection_name
          }))

          // Dispatch custom event for EMRConfigErrorModal to listen to
          window.dispatchEvent(new CustomEvent('emr-configuration-error', {
            detail: {
              message: errorData.message,
              redirect_url: errorData.redirect_url || '/settings/emr-connections',
              connection_name: errorData.connection_name
            }
          }))
        }
      }
    } catch {
      // If we can't parse the response, just continue
      // The calling code will handle the 503 error
    }
  }

  return response
}

/**
 * Convenience wrapper for GET requests
 */
export async function apiGet<T = unknown>(
  endpoint: string,
  options?: ApiRequestOptions
): Promise<T> {
  const response = await apiClient(endpoint, {
    method: 'GET',
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))

    // For 503 EMR configuration errors, don't throw - the error is handled by the modal
    // The modal was already triggered in apiClient(), so just return empty data
    if (response.status === 503 && errorData.error === 'emr_configuration_error') {
      return {} as T
    }

    throw new Error(errorData.detail || `Request failed with status ${response.status}`)
  }

  return response.json()
}

/**
 * Convenience wrapper for POST requests
 */
export async function apiPost<T = unknown>(
  endpoint: string,
  data?: unknown,
  options?: ApiRequestOptions
): Promise<T> {
  const response = await apiClient(endpoint, {
    method: 'POST',
    ...(data ? { body: JSON.stringify(data) } : {}),
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))

    // For 503 EMR configuration errors, don't throw - handled by modal
    if (response.status === 503 && errorData.error === 'emr_configuration_error') {
      return {} as T
    }

    // For 409 Conflict (duplicate check), throw with structured detail object
    if (response.status === 409 && typeof errorData.detail === 'object') {
      const error = new Error(errorData.detail.message || 'Duplicate found')
      // Attach the full detail object for caller to access
      ;(error as any).detail = errorData.detail
      throw error
    }

    throw new Error(errorData.detail || `Request failed with status ${response.status}`)
  }

  return response.json()
}

/**
 * Convenience wrapper for PATCH requests
 */
export async function apiPatch<T = unknown>(
  endpoint: string,
  data?: unknown,
  options?: ApiRequestOptions
): Promise<T> {
  const response = await apiClient(endpoint, {
    method: 'PATCH',
    ...(data ? { body: JSON.stringify(data) } : {}),
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))

    // For 503 EMR configuration errors, don't throw - handled by modal
    if (response.status === 503 && errorData.error === 'emr_configuration_error') {
      return {} as T
    }

    throw new Error(errorData.detail || `Request failed with status ${response.status}`)
  }

  return response.json()
}

/**
 * Convenience wrapper for PUT requests
 */
export async function apiPut<T = unknown>(
  endpoint: string,
  data?: unknown,
  options?: ApiRequestOptions
): Promise<T> {
  const response = await apiClient(endpoint, {
    method: 'PUT',
    ...(data ? { body: JSON.stringify(data) } : {}),
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))

    // For 503 EMR configuration errors, don't throw - handled by modal
    if (response.status === 503 && errorData.error === 'emr_configuration_error') {
      return {} as T
    }

    throw new Error(errorData.detail || `Request failed with status ${response.status}`)
  }

  return response.json()
}

/**
 * Convenience wrapper for DELETE requests
 */
export async function apiDelete<T = unknown>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await apiClient(endpoint, {
    method: 'DELETE',
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))

    // For 503 EMR configuration errors, don't throw - handled by modal
    if (response.status === 503 && errorData.error === 'emr_configuration_error') {
      return {} as T
    }

    throw new Error(errorData.detail || `Request failed with status ${response.status}`)
  }

  // DELETE requests might not return a body
  const text = await response.text()
  return text ? JSON.parse(text) : ({} as T)
}

/**
 * Get telemed URL for an appointment
 *
 * Fetches the telemed join URL from the backend. Only available for
 * EMR adapters that support telemed (e.g., Charm).
 *
 * @param appointmentId - Appointment ID
 * @returns Object with telemed_url property
 * @throws Error if telemed not supported or URL not available
 *
 * @example
 * ```typescript
 * try {
 *   const { telemed_url } = await getTelemedUrl('appointment-id')
 *   window.open(telemed_url, '_blank')
 * } catch (error) {
 *   logger.error('Telemed not available:', error)
 * }
 * ```
 */
export async function getTelemedUrl(
  appointmentId: string
): Promise<{ telemed_url: string }> {
  return apiGet(`/appointments/${appointmentId}/telemed-url`)
}
