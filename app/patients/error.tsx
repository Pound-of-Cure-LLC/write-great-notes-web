'use client'

import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Users } from 'lucide-react'

export default function PatientsError({
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
      title="Error Loading Patients"
      description="We encountered an issue while loading patient information."
      primaryButtonIcon={Users}
    />
  )
}
