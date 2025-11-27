'use client'

import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Calendar } from 'lucide-react'

export default function AppointmentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorBoundary
      error={error}
      reset={reset}
      title="Error Loading Appointments"
      description="We encountered an issue while loading your appointments."
      primaryButtonIcon={Calendar}
    />
  )
}
