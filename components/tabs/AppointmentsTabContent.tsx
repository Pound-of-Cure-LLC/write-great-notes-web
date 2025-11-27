'use client'

import { Loader2 } from 'lucide-react'
import { AppointmentOnlyCard } from '@/components/AppointmentOnlyCard'

type Appointment = {
  id: string
  appointment_datetime: string
  is_telemed?: boolean
  appointment_details?: string | null
  connection_id?: string | null
  provider_name?: string | null
  visit_type?: {
    id: string | null
    name: string
  } | string | null
  emr_settings?: Record<string, any>
}

type AppointmentsTabContentProps = {
  appointments: Appointment[]
  loading: boolean
  onAppointmentClick: (appointmentId: string) => void
}

export function AppointmentsTabContent({
  appointments,
  loading,
  onAppointmentClick,
}: AppointmentsTabContentProps) {
  const parseAppointmentDetails = (apt: Appointment) => {
    let status: string | undefined
    let reason = apt.appointment_details || null

    if (apt.appointment_details?.includes('|')) {
      const parts = apt.appointment_details.split('|').map(p => p.trim())
      status = parts[0] || undefined
      reason = parts.slice(1).join(' | ') || null
    }

    return { status, reason }
  }

  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.appointment_datetime) >= new Date())
    .sort((a, b) => new Date(a.appointment_datetime).getTime() - new Date(b.appointment_datetime).getTime())

  const pastAppointments = appointments
    .filter(apt => new Date(apt.appointment_datetime) < new Date())
    .sort((a, b) => new Date(b.appointment_datetime).getTime() - new Date(a.appointment_datetime).getTime())
    .slice(0, 10)

  return (
    <div className="mb-6 max-w-4xl mx-auto px-4">
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Upcoming Appointments */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-center">Upcoming Appointments</h3>
            {upcomingAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-3">No upcoming appointments</p>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((apt) => {
                  const { status, reason } = parseAppointmentDetails(apt)
                  return (
                    <div key={apt.id} className="flex justify-center">
                      <AppointmentOnlyCard
                        appointment={{
                          id: apt.id,
                          appointment_datetime: apt.appointment_datetime,
                          ...(apt.is_telemed !== undefined && { is_telemed: apt.is_telemed }),
                          appointment_details: reason,
                          connection_id: apt.connection_id ?? null,
                          provider_name: apt.provider_name ?? null,
                          visit_type: typeof apt.visit_type === 'string' ? { name: apt.visit_type, id: null } : apt.visit_type ?? null,
                          emr_settings: {
                            ...apt.emr_settings,
                            ...(status && { appointment_status: status }),
                            ...(reason && { reason_for_appointment: reason })
                          }
                        }}
                        onClick={() => onAppointmentClick(apt.id)}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Past Appointments */}
          <div className="space-y-3 mt-6">
            <h3 className="text-sm font-semibold text-center">Past Appointments</h3>
            {pastAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-3">No past appointments</p>
            ) : (
              <div className="space-y-3">
                {pastAppointments.map((apt) => {
                  const { status, reason } = parseAppointmentDetails(apt)
                  return (
                    <div key={apt.id} className="flex justify-center">
                      <AppointmentOnlyCard
                        appointment={{
                          id: apt.id,
                          appointment_datetime: apt.appointment_datetime,
                          ...(apt.is_telemed !== undefined && { is_telemed: apt.is_telemed }),
                          appointment_details: reason,
                          connection_id: apt.connection_id ?? null,
                          provider_name: apt.provider_name ?? null,
                          visit_type: typeof apt.visit_type === 'string' ? { name: apt.visit_type, id: null } : apt.visit_type ?? null,
                          emr_settings: {
                            ...apt.emr_settings,
                            ...(status && { appointment_status: status }),
                            ...(reason && { reason_for_appointment: reason })
                          }
                        }}
                        onClick={() => onAppointmentClick(apt.id)}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
