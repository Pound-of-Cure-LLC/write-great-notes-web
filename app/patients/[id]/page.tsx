'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TranscriptionStatusProvider } from '@/contexts/TranscriptionStatusContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PatientCard } from '@/components/PatientCard'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Loader2, User as UserIcon, FileText, Calendar, Activity, Sparkles, Stethoscope } from 'lucide-react'
import { apiGet, apiPatch, apiPost } from '@/lib/api-client'
import { PatientDetailsTabContent } from '@/components/tabs/PatientDetailsTabContent'
import { SummaryTabContent } from '@/components/tabs/SummaryTabContent'
import { VitalsTabContent } from '@/components/tabs/VitalsTabContent'
import { PastNotesTabContent } from '@/components/tabs/PastNotesTabContent'
import { AppointmentsTabContent } from '@/components/tabs/AppointmentsTabContent'
import { ProvidersTabContent } from '@/components/tabs/ProvidersTabContent'
import type { SelectedProvider } from '@/components/ProviderPicker'
import { AppLayout } from '@/components/AppLayout'
import { useCapabilities, CAPABILITIES } from '@/lib/capabilities'
import { createClient } from '@/lib/supabase/client'
import type { User as AuthUser } from '@supabase/supabase-js'
import type { VisitType } from '@/types'
import type { PastNote } from '@/types/past-note'
import { PastNotesDialog } from '@/components/PastNotesDialog'
import { usePastNotes } from '@/hooks/usePastNotes'
import { useDefaultProviderState } from '@/hooks/useDefaultProviderState'
import Link from 'next/link'

import { logger } from "@/lib/logger";
type Patient = {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string | null
  gender: string | null
  phone: string | null
  email: string | null
  mrn: string | null
  address: {
    street?: string
    city?: string
    state?: string
    zip?: string
  } | null
  is_active: boolean
  is_local: boolean
}

type Appointment = {
  id: string
  patient_id: string
  provider_id: string
  appointment_datetime: string
  visit_type_id: string | null
  status?: string | null
  appointment_details: string | null
  connection_id?: string | null
  is_telemed?: boolean
  duration_minutes?: number
  visit_type?: {
    id: string | null
    name: string
  }
  emr_settings?: {
    reason_for_appointment?: string
    [key: string]: any
  }
}

export default function PatientDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string
  const capabilities = useCapabilities()

  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [inactivateDialogOpen, setInactivateDialogOpen] = useState(false)
  const [inactivating, setInactivating] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'summary' | 'vitals' | 'notes' | 'appointments' | 'providers'>('details')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loadingAppointments, setLoadingAppointments] = useState(false)
  const [selectedPastNote, setSelectedPastNote] = useState<PastNote | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [summary, setSummary] = useState<string>('')
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [vitals, setVitals] = useState<any[]>([])
  const [vitalDefinitions, setVitalDefinitions] = useState<any[]>([])
  const [vitalsLoading, setVitalsLoading] = useState(false)
  const [providers, setProviders] = useState<SelectedProvider[]>([])
  const [providersLoading, setProvidersLoading] = useState(false)

  // Use custom hooks
  const { notes: pastNotes, loading: loadingPastNotes, fetchNotes: fetchPastNotes } = usePastNotes()
  const { defaultState: organizationState } = useDefaultProviderState()

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    email: '',
    mrn: '',
    address_street: '',
    address_city: '',
    address_state: '',
    address_zip: ''
  })

  // Extract transcription IDs from past notes for status subscription (must be before early returns)
  // Note: Appointments on this page don't have transcription_id in their data model
  // AppointmentOnlyCard's AppointmentStatusBar will subscribe dynamically
  const transcriptionIds = useMemo(() => {
    const ids: string[] = [];

    // Add transcription IDs from past notes
    pastNotes.forEach(note => {
      if (note.transcriptions?.id) {
        ids.push(note.transcriptions.id);
      }
    });

    return ids;
  }, [pastNotes]);

  useEffect(() => {
    fetchPatient()
    fetchUser()
  }, [patientId])

  const fetchUser = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchPatient = async () => {
    try {
      setLoading(true)
      const data = await apiGet<Patient>(`/patients/${patientId}`)
      setPatient(data)
      setFormData({
        first_name: data.first_name,
        last_name: data.last_name,
        date_of_birth: data.date_of_birth || '',
        gender: data.gender || '',
        phone: data.phone || '',
        email: data.email || '',
        mrn: data.mrn || '',
        address_street: data.address?.street || '',
        address_city: data.address?.city || '',
        address_state: data.address?.state || '',
        address_zip: data.address?.zip || ''
      })
    } catch (err) {
      logger.error('Failed to fetch patient', err)
      setError('Failed to load patient details')
    } finally {
      setLoading(false)
    }
  }

  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true)
      const data = await apiGet<{ appointments: Appointment[] }>(`/appointments?patient_id=${patientId}`)
      // Sort appointments in reverse chronological order (newest first)
      const sortedAppointments = data.appointments.sort((a, b) => {
        return new Date(b.appointment_datetime).getTime() - new Date(a.appointment_datetime).getTime()
      })
      setAppointments(sortedAppointments)
    } catch (err) {
      logger.error('Failed to fetch appointments', err)
    } finally {
      setLoadingAppointments(false)
    }
  }

  // Fetch data when switching to tabs
  useEffect(() => {
    if (activeTab === 'notes' && pastNotes.length === 0) {
      fetchPastNotes(patientId, 20)
    }
    if (activeTab === 'appointments' && appointments.length === 0) {
      fetchAppointments()
    }
  }, [activeTab, patientId, pastNotes.length, fetchPastNotes])

  // Generate summary when past notes are loaded
  useEffect(() => {
    const generateSummary = async () => {
      if (activeTab === 'summary' && pastNotes.length > 0 && !summary) {
        setSummaryLoading(true)
        try {
          const response = await apiPost<{ summary: string }>(
            `/patients/${patientId}/generate-summary`,
            { notes: pastNotes }
          )
          setSummary(response.summary)
        } catch (error) {
          logger.error('Error generating summary:', error)
          setSummary('Failed to generate summary. Please try again.')
        } finally {
          setSummaryLoading(false)
        }
      }
    }

    generateSummary()
  }, [activeTab, patientId, pastNotes.length, summary])

  // Fetch vitals when vitals tab is active
  useEffect(() => {
    const fetchVitals = async () => {
      if (activeTab === 'vitals' && vitals.length === 0) {
        setVitalsLoading(true)
        try {
          const [vitalsData, vitalDefsData] = await Promise.all([
            apiGet<{ vitals: any[] }>(`/vitals/by-patient/${patientId}`),
            apiGet<{ vital_definitions: any[] }>('/vital-definitions')
          ])

          setVitals(vitalsData.vitals)
          setVitalDefinitions(vitalDefsData.vital_definitions || [])
        } catch (error) {
          logger.error('Error fetching vitals:', error)
        } finally {
          setVitalsLoading(false)
        }
      }
    }

    fetchVitals()
  }, [activeTab, patientId, vitals.length])

  // Fetch providers when providers tab is active
  useEffect(() => {
    const fetchProviders = async () => {
      if (activeTab === 'providers' && providers.length === 0) {
        setProvidersLoading(true)
        try {
          const data = await apiGet<{ providers: any[] }>(`/patients/${patientId}/providers`)

          // Map to SelectedProvider format
          const mappedProviders: SelectedProvider[] = data.providers.map((p: any) => ({
            id: p.organization_provider_id,
            organization_id: p.provider?.organization_id || p.organization_id || "",
            npi: p.provider?.npi || p.npi,
            provider_name: p.provider?.provider_name || p.provider_name,
            credentials: p.provider?.credentials || p.credentials,
            specialty: p.provider?.specialty || p.specialty,
            address: p.provider?.address || p.address,
            phone: p.provider?.phone || p.phone,
            fax: p.provider?.fax || p.fax,
            source: (p.provider?.source || p.source || "custom") as "npi" | "custom",
            is_active: p.provider?.is_active ?? p.is_active ?? true,
            is_primary: p.is_primary,
            receives_communication: p.receives_communication,
            is_referring: p.is_referring ?? false,
            notes: p.notes,
          }))

          setProviders(mappedProviders)
        } catch (error) {
          logger.error('Error fetching providers:', error)
        } finally {
          setProvidersLoading(false)
        }
      }
    }

    fetchProviders()
  }, [activeTab, patientId, providers.length])

  const handleProvidersUpdate = async () => {
    // Refresh providers after update
    setProviders([])
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const cleanedData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        phone: formData.phone || null,
        email: formData.email || null,
        mrn: formData.mrn || null,
        address: (formData.address_street || formData.address_city || formData.address_state || formData.address_zip) ? {
          street: formData.address_street || null,
          city: formData.address_city || null,
          state: formData.address_state || null,
          zip: formData.address_zip || null,
        } : null,
      }

      await apiPatch(`/patients/${patientId}`, cleanedData)
      router.push('/patients')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save patient'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleInactivate = async () => {
    try {
      setInactivating(true)
      await apiPatch(`/patients/${patientId}`, { is_active: false })
      setInactivateDialogOpen(false)
      router.push('/patients')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to inactivate patient'
      setError(message)
    } finally {
      setInactivating(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading patient details...</p>
        </div>
      </AppLayout>
    )
  }

  if (!patient) {
    return (
      <AppLayout>
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">Patient not found</p>
            <div className="text-center mt-4">
              <Button onClick={() => router.push('/patients')}>
                Back to Patients
              </Button>
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    )
  }

  return (
    <TranscriptionStatusProvider transcriptionIds={transcriptionIds}>
      <AppLayout>
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/patients">Patients</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {patient.first_name} {patient.last_name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Patient Card Header */}
      <div className="mb-4 flex justify-center">
        <PatientCard
          patient={patient}
          showAppointments={false}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'details' | 'summary' | 'vitals' | 'notes' | 'appointments' | 'providers')} className="mb-6">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
          <TabsTrigger
            value="details"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <UserIcon className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Details</span>
          </TabsTrigger>
          <TabsTrigger
            value="summary"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            disabled={pastNotes.length === 0}
          >
            <Sparkles className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Summary</span>
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <FileText className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Past Notes</span>
          </TabsTrigger>
          <TabsTrigger
            value="appointments"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Calendar className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Appointments</span>
          </TabsTrigger>
          <TabsTrigger
            value="vitals"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Activity className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Vitals</span>
          </TabsTrigger>
          <TabsTrigger
            value="providers"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Stethoscope className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Providers</span>
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <PatientDetailsTabContent
            formData={formData}
            onFormDataChange={(data) => setFormData({ ...formData, ...data })}
            onSave={handleSave}
            onInactivate={() => setInactivateDialogOpen(true)}
            saving={saving}
            error={error}
          />
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary">
          <SummaryTabContent
            summary={summary}
            loading={summaryLoading}
          />
        </TabsContent>

        {/* Past Notes Tab */}
        <TabsContent value="notes">
          <PastNotesTabContent
            notes={pastNotes}
            loading={loadingPastNotes}
            onNoteClick={(note) => setSelectedPastNote(note)}
          />
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments">
          <AppointmentsTabContent
            appointments={appointments}
            loading={loadingAppointments}
            onAppointmentClick={(appointmentId) => router.push(`/appointments/${appointmentId}/transcribe`)}
          />
        </TabsContent>

        {/* Vitals Tab */}
        <TabsContent value="vitals">
          <VitalsTabContent
            appointmentId=""
            patientId={patientId}
            isReadOnly={false}
            vitals={vitals}
            vitalDefinitions={vitalDefinitions}
            loading={vitalsLoading}
          />
        </TabsContent>

        {/* Providers Tab */}
        <TabsContent value="providers">
          <ProvidersTabContent
            patientId={patientId}
            initialProviders={providers}
            onUpdate={handleProvidersUpdate}
            defaultState={organizationState}
            isLocalPatient={patient?.is_local ?? true}
          />
        </TabsContent>
      </Tabs>

      {/* Past Note Detail Dialog */}
      <PastNotesDialog
        note={selectedPastNote}
        isOpen={!!selectedPastNote}
        onClose={() => setSelectedPastNote(null)}
      />

      {/* Inactivate Confirmation Dialog */}
      <Dialog open={inactivateDialogOpen} onOpenChange={setInactivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inactivate Patient</DialogTitle>
            <DialogDescription>
              Are you sure you want to inactivate {patient.first_name} {patient.last_name}?
              This will hide the patient from the active patients list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInactivateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleInactivate}
              disabled={inactivating}
            >
              {inactivating ? 'Inactivating...' : 'Inactivate Patient'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
    </TranscriptionStatusProvider>
  )
}
