'use client'

import { VitalsSection } from '@/components/VitalsSection'
import { Vital, VitalDefinition } from '@/types'

type VitalsTabContentProps = {
  appointmentId: string
  patientId: string
  isReadOnly: boolean
  vitals: Vital[]
  vitalDefinitions: VitalDefinition[]
  loading: boolean
}

export function VitalsTabContent({
  appointmentId,
  patientId,
  isReadOnly,
  vitals,
  vitalDefinitions,
  loading,
}: VitalsTabContentProps) {
  return (
    <div className="mb-6 max-w-4xl mx-auto">
      <VitalsSection
        appointmentId={appointmentId}
        patientId={patientId}
        isReadOnly={isReadOnly}
        vitals={vitals}
        vitalDefinitions={vitalDefinitions}
        loading={loading}
      />
    </div>
  )
}
