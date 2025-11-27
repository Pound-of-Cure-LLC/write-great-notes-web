'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, type LucideIcon } from 'lucide-react'

import { logger } from "@/lib/logger";
interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
  title?: string
  description?: string
  icon?: LucideIcon
  fullScreen?: boolean
  primaryButtonText?: string
  primaryButtonIcon?: LucideIcon
  secondaryButtonText?: string
  secondaryButtonHref?: string
}

/**
 * Reusable Error Boundary Component
 *
 * Displays error information in a consistent format across the application.
 * Can be customized per route while maintaining UI consistency.
 *
 * @param error - Error object from Next.js error boundary
 * @param reset - Reset function from Next.js error boundary
 * @param title - Custom error title (default: "Something went wrong")
 * @param description - Custom error description
 * @param icon - Custom icon component (default: AlertCircle)
 * @param fullScreen - Whether to display full-screen centered (default: false, shows in container)
 * @param primaryButtonText - Text for primary action button (default: "Try Again")
 * @param primaryButtonIcon - Icon for primary button
 * @param secondaryButtonText - Text for secondary button (default: "Go Home" or "Refresh Page")
 * @param secondaryButtonHref - URL for secondary button (default: based on fullScreen)
 */
export function ErrorBoundary({
  error,
  reset,
  title = "Something went wrong",
  description = "An unexpected error occurred. This has been logged and we'll look into it.",
  icon: Icon = AlertCircle,
  fullScreen = false,
  primaryButtonText = "Try Again",
  primaryButtonIcon: PrimaryIcon,
  secondaryButtonText,
  secondaryButtonHref,
}: ErrorBoundaryProps) {
  useEffect(() => {
    // Log error to error reporting service (e.g., Sentry)
    logger.error('Error boundary caught:', title, error)
  }, [error, title])

  // Default secondary button behavior
  const defaultSecondaryText = fullScreen ? "Go Home" : "Refresh Page"
  const defaultSecondaryHref = fullScreen ? "/appointments" : window.location.href

  const containerClass = fullScreen
    ? "flex min-h-screen items-center justify-center p-4"
    : "container mx-auto p-6"

  const cardClass = fullScreen ? "max-w-md w-full" : "max-w-2xl mx-auto"

  return (
    <div className={containerClass}>
      <Card className={cardClass}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-destructive" />
            <CardTitle>{title}</CardTitle>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <div className="rounded-md bg-muted p-3 text-sm">
              <p className="font-mono text-xs text-muted-foreground break-all">
                {error.message}
              </p>
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={reset} className="flex-1">
              {PrimaryIcon && <PrimaryIcon className="h-4 w-4 mr-2" />}
              {primaryButtonText}
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = secondaryButtonHref || defaultSecondaryHref}
              className="flex-1"
            >
              {secondaryButtonText || defaultSecondaryText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
