'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Loader2, Search, Filter, FileText, Users, Clock, User } from 'lucide-react'
import { apiGet } from '@/lib/api-client'
import { useCapabilities, CAPABILITIES } from '@/lib/capabilities'
import { AppLayout } from '@/components/AppLayout'
import { PatientCard } from '@/components/PatientCard'
import { NoteCard } from '@/components/NoteCard'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { createClient } from "@/lib/supabase/client"
import { formatDate, formatTime, calculateAge } from "@/lib/date-utils"
import type { TranscriptionStatus } from "@/types/note"
import { TranscriptionStatusProvider } from "@/contexts/TranscriptionStatusContext"
import { AppointmentStatusBar } from "@/components/AppointmentStatusBar"

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
  phr_login_id?: string | null
  created_at?: string
  last_appointment?: string | null
  last_appointment_id?: string | null
  next_appointment?: string | null
  next_appointment_id?: string | null
}

type VisitType = {
  id: string
  name: string
}

type Note = {
  id: string
  brief_summary?: string
  is_signed: boolean
  signed_at?: string
  created_at: string
  updated_at?: string
  transcription_id?: string
  transcription_status?: TranscriptionStatus
  provider_id?: string
  provider_name?: string  // Provider who created the note (from backend)
  visit_type?: string  // Visit type name (from backend)
  emr_settings?: {
    emr_note_id?: string
    patient_id?: string  // For filtering notes by patient
    appointment_datetime?: string  // For display in Recent Notes
    appointment_id?: string  // For navigation (local appointments)
    external_appointment_id?: string  // For navigation (EMR appointments)
  }
  transcriptions?: {
    id: string
    appointment_id?: string
    external_appointment_id?: string
    appointments?: {
      id: string
      appointment_datetime: string
      patient_id: string
      visit_types?: VisitType
    }
  }
}

type NotesResponse = {
  notes: Note[]
}

type Provider = {
  id: string
  first_name: string
  last_name: string
  email: string
  roles: string[]
}

type AuthUser = {
  id: string
  email: string
}

export default function PatientsPage() {
  const router = useRouter()
  const capabilities = useCapabilities()

  // Separate state for each tab to prevent cross-contamination
  const [recentNotesPatients, setRecentNotesPatients] = useState<Patient[]>([]) // For Recent Notes tab
  const [searchPatients, setSearchPatients] = useState<Patient[]>([]) // For Patients tab
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]) // For Recent Patients tab

  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState<Note[]>([])
  const [notesLoading, setNotesLoading] = useState(false)
  const [activeView, setActiveView] = useState<'recent-notes' | 'patients' | 'recent-patients'>('recent-notes')

  // Search filter states for Patients tab
  const [mrnSearch, setMrnSearch] = useState('')
  const [emailSearch, setEmailSearch] = useState('')
  const [phoneSearch, setPhoneSearch] = useState('')

  // Recent Patients tab state
  const [recentPatientsLoading, setRecentPatientsLoading] = useState(false)

  // Provider filter state
  const [providersList, setProvidersList] = useState<Provider[]>([])
  const [selectedProviderIds, setSelectedProviderIds] = useState<string[]>([])
  const [providerFilterOpen, setProviderFilterOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)

  // Fetch user data and providers on mount
  useEffect(() => {
    const fetchUserAndProviders = async () => {
      try {
        const supabase = createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (authUser) {
          setUser({ id: authUser.id, email: authUser.email || '' })

          // Fetch providers list
          const usersData = await apiGet<Provider[]>(`/users`)
          const providers = usersData.filter(u => u.roles.includes('provider'))
          setProvidersList(providers)

          // Initialize provider filter based on user role
          const currentUserIsProvider = providers.some(p => p.id === authUser.id)

          if (currentUserIsProvider) {
            // If user is a provider, only select their own ID
            setSelectedProviderIds([authUser.id])
          } else {
            // If user is not a provider, select all providers
            setSelectedProviderIds(providers.map(p => p.id))
          }
        }
      } catch (err) {
        logger.error('Failed to fetch user or providers', err)
      }
    }

    fetchUserAndProviders()
  }, [])

  // Fetch Recent Notes data on mount and when provider filter changes
  useEffect(() => {
    if (selectedProviderIds.length > 0 || providersList.length === 0) {
      fetchRecentNotesData()
    }
  }, [selectedProviderIds])

  const fetchRecentNotesData = async () => {
    try {
      setLoading(true)
      setNotesLoading(true)

      // Optimized data fetching for Recent Notes tab
      // Step 1: Fetch 100 most recent notes with patient_id in emr_settings
      const notesData = await apiGet<NotesResponse>('/notes/recent?limit=100')

      setNotes(notesData.notes)

      // Step 2: Extract unique patient IDs from notes
      const patientIds = [...new Set(
        notesData.notes
          .map(note => note.emr_settings?.patient_id)
          .filter((id): id is string => !!id)
      )]

      // Step 3: Fetch ONLY those patients (if there are any patient IDs)
      if (patientIds.length > 0) {
        const patientsData = await apiGet<{ patients: Patient[] }>(
          `/patients?patient_ids=${patientIds.join(',')}`
        )
        setRecentNotesPatients(patientsData.patients)
      } else {
        setRecentNotesPatients([])
      }
    } catch (err) {
      logger.error('Failed to fetch recent notes data', err)
    } finally {
      setLoading(false)
      setNotesLoading(false)
    }
  }

  // Search patients with filters (for Patients tab)
  const handleSearchPatients = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      if (mrnSearch) params.append('record_id_contains', mrnSearch)
      if (emailSearch) params.append('email_contains', emailSearch)
      if (phoneSearch) params.append('mobile_contains', phoneSearch)

      const queryString = params.toString()
      const url = `/patients${queryString ? `?${queryString}` : ''}`

      const patientsData = await apiGet<{ patients: Patient[] }>(url)
      setSearchPatients(patientsData.patients)
    } catch (err) {
      logger.error('Failed to search patients', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch recent patients (for Recent Patients tab)
  const fetchRecentPatients = async () => {
    try {
      setRecentPatientsLoading(true)

      const patientsData = await apiGet<{ patients: Patient[] }>(
        '/patients?sort_column=created_time&sort_order=D&limit=100'
      )
      setRecentPatients(patientsData.patients)
    } catch (err) {
      logger.error('Failed to fetch recent patients', err)
    } finally {
      setRecentPatientsLoading(false)
    }
  }

  // Fetch recent patients when tab is activated
  useEffect(() => {
    if (activeView === 'recent-patients' && recentPatients.length === 0) {
      fetchRecentPatients()
    }
  }, [activeView])

  // Clear search filters
  const clearSearchFilters = () => {
    setMrnSearch('')
    setEmailSearch('')
    setPhoneSearch('')
    setSearchPatients([])
  }

  // Provider filter functions
  const toggleProviderSelection = (providerId: string) => {
    setSelectedProviderIds(prev => {
      if (prev.includes(providerId)) {
        return prev.filter(id => id !== providerId)
      } else {
        return [...prev, providerId]
      }
    })
  }

  const selectAllProviders = () => {
    setSelectedProviderIds(providersList.map(p => p.id))
  }

  const deselectAllProviders = () => {
    setSelectedProviderIds([])
  }

  // Get patients with notes for "Recent Notes" tab, filtered by selected providers
  const getPatientsWithNotes = () => {
    // Create patient lookup map from Recent Notes patients
    const patientMap = Object.fromEntries(
      recentNotesPatients.map(p => [p.id, p])
    )

    // Filter notes by selected providers
    const filteredNotes = selectedProviderIds.length === 0
      ? notes
      : notes.filter(note => note.provider_id && selectedProviderIds.includes(note.provider_id))

    // Group notes by patient_id (from emr_settings)
    // Notes are already sorted by updated_at DESC from the API
    const notesByPatientId: Record<string, Note[]> = {}
    for (const note of filteredNotes) {
      const patientId = note.emr_settings?.patient_id
      if (patientId) {
        if (!notesByPatientId[patientId]) {
          notesByPatientId[patientId] = []
        }
        notesByPatientId[patientId].push(note)
      }
    }

    // Build result array with patients and their notes
    // Sort patients by their most recent note's updated_at (not created_at)
    const result: Array<{ patient: Patient; notes: Note[] }> = []
    for (const [patientId, patientNotes] of Object.entries(notesByPatientId)) {
      const patient = patientMap[patientId]
      if (patient) {
        result.push({ patient, notes: patientNotes })
      }
    }

    // Sort by most recent note's updated_at DESC (fallback to created_at if updated_at is missing)
    result.sort((a, b) => {
      const aMostRecent = a.notes[0] // First note is most recent (already sorted by updated_at DESC)
      const bMostRecent = b.notes[0]
      
      // Handle case where notes array might be empty
      if (!aMostRecent && !bMostRecent) return 0
      if (!aMostRecent) return 1 // Patients without notes go to end
      if (!bMostRecent) return -1 // Patients without notes go to end
      
      const aDate = aMostRecent.updated_at || aMostRecent.created_at
      const bDate = bMostRecent.updated_at || bMostRecent.created_at
      return new Date(bDate).getTime() - new Date(aDate).getTime()
    })

    return result
  }

  const patientsWithNotes = getPatientsWithNotes()

  // Collect all transcription_ids for TranscriptionStatusProvider
  const transcriptionIds = notes
    .map(note => note.transcription_id)
    .filter((id): id is string => !!id)

  return (
    <TranscriptionStatusProvider transcriptionIds={transcriptionIds}>
      <AppLayout>
      {/* Tabs for view switching */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'recent-notes' | 'patients' | 'recent-patients')} className="mb-6">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
          <TabsTrigger
            value="recent-notes"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <FileText className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Recent Notes</span>
          </TabsTrigger>
          <TabsTrigger
            value="patients"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Filter className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Patients</span>
          </TabsTrigger>
          <TabsTrigger
            value="recent-patients"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Clock className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Recent Patients</span>
          </TabsTrigger>
        </TabsList>

        {/* Recent Notes Tab Content */}
        <TabsContent value="recent-notes">
          {/* Provider Filter - Only show if more than 1 provider */}
          {providersList.length > 1 && (
            <div className="mb-6 flex justify-start">
              <Popover open={providerFilterOpen} onOpenChange={setProviderFilterOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Providers
                    {selectedProviderIds.length > 0 && selectedProviderIds.length < providersList.length && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded">
                        {selectedProviderIds.length}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64" align="start">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">Filter by Provider</h4>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={selectAllProviders}
                        >
                          All
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={deselectAllProviders}
                        >
                          None
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {providersList.map((provider) => (
                        <div
                          key={provider.id}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-muted p-1 rounded"
                          onClick={() => toggleProviderSelection(provider.id)}
                        >
                          <Checkbox
                            id={`provider-${provider.id}`}
                            checked={selectedProviderIds.includes(provider.id)}
                            onCheckedChange={() => toggleProviderSelection(provider.id)}
                          />
                          <label
                            htmlFor={`provider-${provider.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                          >
                            {provider.first_name} {provider.last_name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Content */}
          {loading || notesLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading recent notes...</p>
            </div>
          ) : patientsWithNotes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No notes found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedProviderIds.length === 0
                    ? 'Select at least one provider from the filter above'
                    : 'Generate notes from appointments to see them here'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {patientsWithNotes.map(({ patient, notes: patientNotes }) => (
                <Card key={patient.id} className="overflow-hidden max-w-[700px] border-l-4 border-jordy-blue">
                  {/* Patient Header - Compact mode */}
                  <div
                    className="p-4 flex items-center gap-4 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border"
                    onClick={() => router.push(`/patients/${patient.id}`)}
                  >
                    <div className="flex-grow flex items-center gap-6 text-sm">
                      {/* Name */}
                      <div className="min-w-[180px]">
                        <div className="flex items-center gap-2">
                          {patient.phr_login_id && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <User className="h-4 w-4 text-primary" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Patient Portal Access</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          <span className="font-semibold text-foreground">
                            {patient.first_name} {patient.last_name}
                          </span>
                        </div>
                      </div>

                      {/* DOB */}
                      {patient.date_of_birth && (
                        <div className="min-w-[120px] text-muted-foreground">
                          {formatDate(patient.date_of_birth)}
                          {calculateAge(patient.date_of_birth) !== null && (
                            <span> ({calculateAge(patient.date_of_birth)})</span>
                          )}
                        </div>
                      )}

                      {/* Gender */}
                      {patient.gender && (
                        <div className="min-w-[80px] text-muted-foreground capitalize">
                          {patient.gender}
                        </div>
                      )}

                      {/* MRN */}
                      {patient.mrn && (
                        <div className="min-w-[100px] text-muted-foreground">
                          MRN: {patient.mrn}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes for this patient - stacked directly below */}
                  <div className="divide-y divide-border">
                    {patientNotes.map((note) => {
                      // Get appointment datetime from multiple possible sources
                      const appointmentDateTime =
                        note.emr_settings?.appointment_datetime ||
                        note.transcriptions?.appointments?.appointment_datetime;
                      const date = appointmentDateTime ? formatDate(appointmentDateTime) : 'N/A';
                      const time = appointmentDateTime ? formatTime(appointmentDateTime) : 'N/A';

                      // Get visit type
                      const visitTypeName = note.visit_type || note.transcriptions?.appointments?.visit_types?.name;

                      // Get summary
                      const summaryText = note.brief_summary;

                      // Get status badge
                      const getStatusBadge = () => {
                        if (note.is_signed) {
                          return (
                            <Badge variant="default" className="bg-jordy-blue text-[10px] px-2 py-0.5">
                              Signed
                            </Badge>
                          );
                        }
                        if (note.emr_settings?.emr_note_id) {
                          return (
                            <Badge variant="default" className="bg-uranian-blue text-[10px] px-2 py-0.5">
                              Pushed
                            </Badge>
                          );
                        }
                        return (
                          <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                            Completed
                          </Badge>
                        );
                      };

                      return (
                        <div
                          key={note.id}
                          className="p-3 hover:bg-muted/30 transition-colors cursor-pointer flex items-center gap-3"
                          onClick={() => router.push(`/notes/${note.id}`)}
                        >
                          {/* Left Sidebar - Date/Time (compact) */}
                          <div className="bg-primary/10 px-3 py-2 flex items-center justify-center rounded-lg w-20 shrink-0">
                            <div className="flex flex-col items-center gap-1">
                              <FileText className="h-4 w-4 text-primary" />
                              <p className="text-xs font-semibold text-primary text-center whitespace-nowrap">
                                {date}
                              </p>
                              <p className="text-xs text-muted-foreground whitespace-nowrap">
                                {time}
                              </p>
                            </div>
                          </div>

                          {/* Main Content - Note Info */}
                          <div className="flex-grow min-w-0">
                            <div className="space-y-1">
                              {/* Top Row: Visit Type, Provider Name, Status Indicator, and Status Badge */}
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2 flex-wrap min-w-0">
                                  {visitTypeName && (
                                    <h3 className="text-sm font-semibold text-foreground">
                                      {visitTypeName}
                                    </h3>
                                  )}
                                  {note.provider_name && (
                                    <span className="text-xs text-muted-foreground">
                                      by <span className="font-medium">{note.provider_name}</span>
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {note.transcription_status && (
                                    <AppointmentStatusBar
                                      transcriptionStatus={note.transcription_status}
                                    />
                                  )}
                                  {getStatusBadge()}
                                </div>
                              </div>

                              {/* Summary Text */}
                              {summaryText ? (
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {summaryText}
                                </p>
                              ) : (
                                <p className="text-xs text-muted-foreground italic">
                                  No summary available
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Patients Tab Content */}
        <TabsContent value="patients">
          {/* New Patient Button */}
          {capabilities.has(CAPABILITIES.CREATE_PATIENT) && (
            <div className="mb-6 flex justify-end">
              <Button
                onClick={() => router.push('/patients/new')}
                data-testid="new-patient-button"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                New Patient
              </Button>
            </div>
          )}

          {/* Search Filters */}
          <div className="mb-6 p-3 bg-muted/30 rounded-lg border border-border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              {/* MRN Search */}
              <div className="space-y-1">
                <Label htmlFor="mrn-search" className="text-xs">MRN</Label>
                <Input
                  id="mrn-search"
                  type="text"
                  placeholder="Search by MRN..."
                  value={mrnSearch}
                  onChange={(e) => setMrnSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchPatients()
                    }
                  }}
                  className="h-8 text-sm"
                />
              </div>

              {/* Email Search */}
              <div className="space-y-1">
                <Label htmlFor="email-search" className="text-xs">Email</Label>
                <Input
                  id="email-search"
                  type="text"
                  placeholder="Search by email..."
                  value={emailSearch}
                  onChange={(e) => setEmailSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchPatients()
                    }
                  }}
                  className="h-8 text-sm"
                />
              </div>

              {/* Phone Search */}
              <div className="space-y-1">
                <Label htmlFor="phone-search" className="text-xs">Phone</Label>
                <Input
                  id="phone-search"
                  type="text"
                  placeholder="Search by phone..."
                  value={phoneSearch}
                  onChange={(e) => setPhoneSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchPatients()
                    }
                  }}
                  className="h-8 text-sm"
                />
              </div>

              {/* Search Button */}
              <div className="flex items-center gap-2">
                <Button onClick={handleSearchPatients} disabled={loading} className="flex-1 h-8 text-sm">
                  {loading ? (
                    <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                  ) : (
                    <Search className="h-3 w-3 mr-1.5" />
                  )}
                  Search
                </Button>

                {(mrnSearch || emailSearch || phoneSearch || searchPatients.length > 0) && (
                  <Button
                    variant="outline"
                    onClick={clearSearchFilters}
                    className="h-8 text-sm"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Results Count */}
            {searchPatients.length > 0 && (
              <div className="mt-3 text-sm text-muted-foreground">
                {searchPatients.length} {searchPatients.length === 1 ? 'patient' : 'patients'} found
              </div>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Searching patients...</p>
            </div>
          ) : searchPatients.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No patients found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {mrnSearch || emailSearch || phoneSearch
                    ? 'Try adjusting your search criteria'
                    : 'Enter search criteria and click Search'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {searchPatients.map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  onClick={() => router.push(`/patients/${patient.id}`)}
                  showAppointments={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Recent Patients Tab Content */}
        <TabsContent value="recent-patients">
          {/* New Patient Button Only */}
          {capabilities.has(CAPABILITIES.CREATE_PATIENT) && (
            <div className="mb-6 flex justify-end">
              <Button
                onClick={() => router.push('/patients/new')}
                data-testid="new-patient-button"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                New Patient
              </Button>
            </div>
          )}

          {/* Content */}
          {recentPatientsLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading recent patients...</p>
            </div>
          ) : recentPatients.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No patients found</p>
                {capabilities.has(CAPABILITIES.CREATE_PATIENT) && (
                  <Button
                    className="mt-4"
                    onClick={() => router.push('/patients/new')}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create First Patient
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recentPatients.map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  onClick={() => router.push(`/patients/${patient.id}`)}
                  showAppointments={true}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AppLayout>
    </TranscriptionStatusProvider>
  )
}
