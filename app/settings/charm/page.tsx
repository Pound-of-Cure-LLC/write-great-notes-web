'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { NavigationMenu } from '@/components/NavigationMenu'
import { VitalsMappingSection } from '@/components/settings/VitalsMappingSection'
import { apiGet, apiPost, apiPatch } from '@/lib/api-client'
import { CheckCircle2, XCircle, Loader2, AlertCircle, Plus, X } from 'lucide-react'

import { logger } from "@/lib/logger";
type ConnectionStatus = {
  success: boolean
  message: string
  details?: Record<string, unknown>
}

type CharmMember = {
  id?: string
  member_id?: string
  firstName?: string
  lastName?: string
  full_name?: string
  name?: string
  active?: boolean
  _fhir?: Record<string, unknown>
}

type User = {
  id: string
  email: string
  first_name: string
  last_name: string
  emr_settings?: {
    member_id?: string
  }
}

type VisitType = {
  id: string
  name: string
  emr_settings?: {
    charm_visit_type_ids?: string[]
  }
}

type CharmVisitType = {
  visittype_id: string
  visittype_name: string
}

type Location = {
  id: string
  name: string
  address?: string
  emr_settings?: {
    facility_id?: string
  }
}

type CharmFacility = {
  facility_id: string
  facility_name: string
  facility_status?: string
}

export default function CharmSettingsPage() {
  // OAuth Setup State
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [authorizationCode, setAuthorizationCode] = useState('')
  const [authUrl, setAuthUrl] = useState('')
  const [showCodeInput, setShowCodeInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Connection status
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null)
  const [checkingConnection, setCheckingConnection] = useState(false)

  // Location Mapping State
  const [locations, setLocations] = useState<Location[]>([])
  const [charmFacilities, setCharmFacilities] = useState<CharmFacility[]>([])
  const [loadingLocations, setLoadingLocations] = useState(false)

  // User Mapping State
  const [users, setUsers] = useState<User[]>([])
  const [charmMembers, setCharmMembers] = useState<CharmMember[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  // Visit Type Mapping State (organization-level)
  const [visitTypes, setVisitTypes] = useState<VisitType[]>([])
  const [charmVisitTypes, setCharmVisitTypes] = useState<CharmVisitType[]>([])
  const [loadingVisitTypes, setLoadingVisitTypes] = useState(false)
  const [selectedCharmTypes, setSelectedCharmTypes] = useState<Record<string, string>>({})

  // Active section (sidebar navigation)
  const [activeSection, setActiveSection] = useState('connection')

  // Reconnect confirmation dialog
  const [showReconnectDialog, setShowReconnectDialog] = useState(false)

  // Check connection status on load and handle OAuth callback
  useEffect(() => {
    // Check for OAuth callback status in URL first
    const params = new URLSearchParams(window.location.search)
    const status = params.get('status')
    const message = params.get('message')

    if (status === 'success') {
      setSuccess('Charm EHR connection successfully configured!')
      setActiveSection('connection')
      // Clean up URL
      window.history.replaceState({}, '', '/settings/charm')
      // Recheck connection after successful OAuth
      setTimeout(() => checkConnection(), 1000)
    } else if (status === 'error') {
      setError(message || 'Failed to complete OAuth flow')
      // Clean up URL
      window.history.replaceState({}, '', '/settings/charm')
    } else {
      // Only check connection if not handling OAuth callback
      // This prevents 503 errors when credentials aren't set yet
      checkConnection()
    }
  }, [])

  // Load data when switching sections
  useEffect(() => {
    if (activeSection === 'locations' && connectionStatus?.success) {
      loadLocations()
      loadCharmFacilities()
    } else if (activeSection === 'users' && connectionStatus?.success) {
      loadUsers()
      loadCharmMembers()
    } else if (activeSection === 'visit-types' && connectionStatus?.success) {
      loadVisitTypes()
      loadOrgUsers()
      loadCharmVisitTypes()
    }
  }, [activeSection, connectionStatus])

  // Load visit types when visit-types section is active
  useEffect(() => {
    if (activeSection === 'visit-types') {
      loadVisitTypes()
      loadCharmVisitTypes()
    }
  }, [activeSection])

  const checkConnection = async () => {
    setCheckingConnection(true)
    try {
      const status = await apiGet<ConnectionStatus>('/emr-connections/check-connection', {
        suppressEMRModal: true
      })
      setConnectionStatus(status)
    } catch (err: unknown) {
      // Connection not configured yet
      setConnectionStatus({
        success: false,
        message: 'Connection not configured'
      })
    } finally {
      setCheckingConnection(false)
    }
  }

  const handleLoginToCharm = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!clientId || !clientSecret || !apiKey) {
      setError('Please fill in all OAuth credentials')
      return
    }

    // Generate OAuth URL client-side with correct redirect URI and scopes
    // Must match CharmClient.SCOPES in backend (charm_client.py)
    const scopes = [
      // Legacy Charm API scopes (v1 API)
      "charmhealth.user.setting.facility.READ",
      "charmhealth.user.setting.member.READ",
      "charmhealth.patient.demographics.ALL",
      "charmhealth.user.calendar.ALL",
      "charmhealth.patient.questionnaire.ALL",
      "charmhealth.patient.insurance.ALL",
      "charmhealth.patient.document.ALL",
      "charmhealth.user.task.ALL",
      "charmhealth.user.message.ALL",
      "charmhealth.patient.problem.ALL",
      "charmhealth.user.setting.ALL",
      "charmhealth.patient.careteam.ALL",
      "charmhealth.user.template.ALL",
      "charmhealth.patient.chartnote.ALL",
      "charmhealth.patient.vital.ALL",
      "charmhealth.user.setting.questionnaire.ALL",
      "charmhealth.patient.invoice.CREATE",
      "charmhealth.patient.invoice.READ",
      "charmhealth.patient.receipt.READ",
      "charmhealth.user.setting.billing.READ",
      "charmhealth.patient.medication.ALL",
      "charmhealth.patient.medicalhistory.ALL",
      "charmhealth.patient.allergy.ALL",
      "charmhealth.patient.cardonfile.ALL",
      "charmhealth.patient.procedure.ALL",
      // FHIR API scopes (v2 FHIR API)
      "patient/Patient.read",
      "patient/Encounter.read",
      "patient/Observation.read",
      "patient/Condition.read",
      "patient/AllergyIntolerance.read",
      "patient/Medication.read",
      "patient/MedicationRequest.read",
      "patient/MedicationAdministration.read",
      "patient/Procedure.read",
      "patient/Immunization.read",
      "patient/DiagnosticReport.read",
      "patient/DocumentReference.read",
      "patient/Appointment.read",
      "patient/CarePlan.read",
      "patient/CareTeam.read",
      "patient/Goal.read",
      "patient/Device.read",
      "patient/QuestionnaireResponse.read",
      "patient/FamilyMemberHistory.read",
      "patient/RelatedPerson.read",
      "patient/Organization.read",
      "patient/Practitioner.read",
      "patient/Location.read",
      "patient/Provenance.read"
    ]

    const scopeStr = scopes.join(',')
    const redirectUri = 'https://ehr2.charmtracker.com/ehr/physician/mySpace.do?ACTION=SHOW_OAUTH_JSON'

    const url = new URL('https://accounts.charmtracker.com/oauth/v2/auth')
    url.searchParams.set('scope', scopeStr)
    url.searchParams.set('client_id', clientId)
    url.searchParams.set('state', 'test')
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('redirect_uri', redirectUri)
    url.searchParams.set('access_type', 'offline')
    url.searchParams.set('prompt', 'consent')

    const authUrlString = url.toString()
    setAuthUrl(authUrlString)

    // Open OAuth URL in new window
    window.open(authUrlString, '_blank', 'width=600,height=700')

    // Show code input field
    setShowCodeInput(true)
  }

  const handleCompleteAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Call backend with authorization code
      await apiPost('/emr-connections/initiate-charm-auth', {
        client_id: clientId,
        client_secret: clientSecret,
        api_key: apiKey,
        authorization_code: authorizationCode,
      })

      setSuccess('Charm EHR connection successfully configured!')
      setShowCodeInput(false)
      setAuthUrl('')
      setAuthorizationCode('')

      // Recheck connection
      setTimeout(() => checkConnection(), 1000)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete OAuth flow'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const loadLocations = async () => {
    setLoadingLocations(true)
    try {
      const data = await apiGet<Location[]>('/locations')
      setLocations(data)
    } catch (err) {
      logger.error('Failed to load locations:', err)
    } finally {
      setLoadingLocations(false)
    }
  }

  const loadCharmFacilities = async () => {
    try {
      const data = await apiGet<CharmFacility[] | { facilities: CharmFacility[] }>('/emr-connections/locations')
      // Handle Charm response format (could be array or object with facilities key)
      setCharmFacilities(Array.isArray(data) ? data : data.facilities || [])
    } catch (err) {
      logger.error('Failed to load Charm facilities:', err)
    }
  }

  const handleLocationMapping = async (locationId: string, facilityId: string) => {
    try {
      await apiPatch(`/locations/${locationId}`, {
        emr_settings: { facility_id: facilityId || null }
      })
      setSuccess('Location mapping updated successfully')
      setTimeout(() => setSuccess(''), 3000)
      loadLocations()
    } catch (err) {
      setError('Failed to update location mapping')
      setTimeout(() => setError(''), 3000)
    }
  }

  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      const data = await apiGet<User[]>('/users')
      setUsers(data)
    } catch (err) {
      logger.error('Failed to load users:', err)
    } finally {
      setLoadingUsers(false)
    }
  }

  const loadCharmMembers = async () => {
    try {
      const data = await apiGet<CharmMember[] | { members: CharmMember[] }>('/emr-connections/users')
      // Handle Charm response format (could be array or object with members key)
      setCharmMembers(Array.isArray(data) ? data : data.members || [])
    } catch (err) {
      logger.error('Failed to load Charm members:', err)
    }
  }

  const handleUserMapping = async (userId: string, charmMemberId: string) => {
    try {
      await apiPatch(`/users/${userId}`, {
        emr_settings: { member_id: charmMemberId || null }
      })
      setSuccess('User mapping updated successfully')
      setTimeout(() => setSuccess(''), 3000)
      loadUsers()
    } catch (err) {
      setError('Failed to update user mapping')
      setTimeout(() => setError(''), 3000)
    }
  }

  const loadVisitTypes = async () => {
    setLoadingVisitTypes(true)
    try {
      const data = await apiGet<VisitType[]>('/visit-types')
      setVisitTypes(data)
    } catch (err) {
      logger.error('Failed to load visit types:', err)
    } finally {
      setLoadingVisitTypes(false)
    }
  }

  const loadCharmVisitTypes = async () => {
    try {
      // Fetch all visit types from Charm (organization-wide)
      const data = await apiGet<CharmVisitType[]>('/emr-connections/visit-types')
      setCharmVisitTypes(data)
    } catch (err) {
      logger.error('Failed to load Charm visit types:', err)
    }
  }

  const loadOrgUsers = async () => {
    try {
      const data = await apiGet<User[]>('/users')
      setUsers(data)
    } catch (err) {
      logger.error('Failed to load users:', err)
    }
  }

  const handleAddVisitTypeMapping = async (visitTypeId: string, charmVisitTypeId: string) => {
    try {
      await apiPatch(`/visit-types/${visitTypeId}/emr-mappings`, {
        emr_visit_type_id: charmVisitTypeId
      })
      setSuccess('Mapping added')
      setTimeout(() => setSuccess(''), 3000)
      // Reload visit types to get updated mappings
      loadVisitTypes()
    } catch (err: any) {
      setError(err?.message || 'Failed to add mapping')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleRemoveVisitTypeMapping = async (visitTypeId: string, charmVisitTypeId: string) => {
    try {
      // Optimistically update UI
      setVisitTypes(prev => prev.map(vt => {
        if (vt.id !== visitTypeId) return vt
        const currentMappings = vt.emr_settings?.charm_visit_type_ids || []
        return {
          ...vt,
          emr_settings: {
            ...vt.emr_settings,
            charm_visit_type_ids: currentMappings.filter((id: string) => id !== charmVisitTypeId)
          }
        }
      }))

      // Send "remove:<charm_type_id>" to tell backend to remove specific charm type
      await apiPatch(`/visit-types/${visitTypeId}/emr-mappings`, {
        emr_visit_type_id: `remove:${charmVisitTypeId}`
      })
      setSuccess('Mapping removed')
      setTimeout(() => setSuccess(''), 3000)
      loadVisitTypes()
    } catch (err) {
      setError('Failed to remove mapping')
      setTimeout(() => setError(''), 3000)
      // Reload on error to revert optimistic update
      loadVisitTypes()
    }
  }

  return (
    <div>
      {/* Header with hamburger menu, logo, and title */}
      <div className="mb-8 flex items-center gap-4">
        <NavigationMenu />
        <Image
          src="/images/charm-logo.png"
          alt="Charm Health"
          width={120}
          height={40}
          className="object-contain"
          style={{ width: 'auto', height: 'auto' }}
        />
        <div>
          <h1 className="text-2xl font-bold">Charm EHR Integration</h1>
          <p className="text-sm text-muted-foreground">Manage your Charm Health connection and settings</p>
        </div>
      </div>

      {/* Global Status Messages - Only shown outside visit-types section */}
      {activeSection !== 'visit-types' && error && (
        <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {activeSection !== 'visit-types' && success && (
        <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Sidebar Layout */}
      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <aside className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            <button
              key="connection"
              onClick={() => setActiveSection('connection')}
              data-testid="charm-connection-tab"
              className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'connection'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              Connection
            </button>

            {/* Mappings Section */}
            <div key="mappings-header" className="pt-4 pb-2 px-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Mappings
              </h3>
            </div>

            <button
              key="users"
              onClick={() => setActiveSection('users')}
              disabled={!connectionStatus?.success}
              data-testid="charm-users-tab"
              className={`w-full text-left pl-6 pr-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'users'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              } ${!connectionStatus?.success ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Users
            </button>
            <button
              key="locations"
              onClick={() => setActiveSection('locations')}
              disabled={!connectionStatus?.success}
              data-testid="charm-locations-tab"
              className={`w-full text-left pl-6 pr-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'locations'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              } ${!connectionStatus?.success ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Facilities
            </button>
            <button
              key="visit-types"
              onClick={() => setActiveSection('visit-types')}
              disabled={!connectionStatus?.success}
              data-testid="charm-visit-types-tab"
              className={`w-full text-left pl-6 pr-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'visit-types'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              } ${!connectionStatus?.success ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Visit Types
            </button>
            <button
              key="vitals"
              onClick={() => setActiveSection('vitals')}
              disabled={!connectionStatus?.success}
              data-testid="charm-vitals-tab"
              className={`w-full text-left pl-6 pr-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'vitals'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              } ${!connectionStatus?.success ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Vitals
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1">
          {/* Connection Section */}
          {activeSection === 'connection' && (
            <Card>
              <CardHeader>
                <CardTitle>OAuth Configuration</CardTitle>
                <CardDescription>
                  Configure your Charm EHR OAuth credentials to enable integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Connection Status */}
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Connection Status</p>
                    {checkingConnection ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : connectionStatus ? (
                      <Badge
                        variant={connectionStatus.success ? 'default' : 'destructive'}
                        className="gap-1"
                      >
                        {connectionStatus.success ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        {connectionStatus.success ? 'Connected' : 'Disconnected'}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground">{connectionStatus?.message}</p>
                  {connectionStatus?.details && connectionStatus.success && (
                    <div className="mt-3 space-y-1">
                      {connectionStatus.details.facilities_count !== undefined && (
                        <p className="text-xs text-muted-foreground">
                          Facilities: {String(connectionStatus.details.facilities_count)}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {!connectionStatus?.success && (
                  <>
                    <form onSubmit={handleLoginToCharm} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="apiKey">API Key</Label>
                        <Input
                          id="apiKey"
                          type="text"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="Enter your Charm API key"
                          data-testid="charm-api-key-input"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="clientId">Client ID</Label>
                        <Input
                          id="clientId"
                          type="text"
                          value={clientId}
                          onChange={(e) => setClientId(e.target.value)}
                          placeholder="Enter your Charm client ID"
                          data-testid="charm-client-id-input"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="clientSecret">Client Secret</Label>
                        <Input
                          id="clientSecret"
                          type="password"
                          value={clientSecret}
                          onChange={(e) => setClientSecret(e.target.value)}
                          placeholder="Enter your Charm client secret"
                          data-testid="charm-client-secret-input"
                          required
                        />
                      </div>

                      <Button type="submit" data-testid="charm-login-button">
                        Login to Charm
                      </Button>
                    </form>

                    {/* Authorization Code Input - shown after clicking Login to Charm */}
                    {showCodeInput && (
                      <div className="mt-6 space-y-4">
                        <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
                          <p className="text-sm font-medium text-blue-900 mb-2">
                            Copy the Authorization Code
                          </p>
                          <p className="text-sm text-blue-700">
                            After logging into Charm, copy the value shown for &quot;code&quot; and paste it below.
                          </p>
                        </div>

                        <form onSubmit={handleCompleteAuth} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="authCode">Authorization Code</Label>
                            <Input
                              id="authCode"
                              type="text"
                              value={authorizationCode}
                              onChange={(e) => setAuthorizationCode(e.target.value)}
                              placeholder="Paste authorization code here"
                              required
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button type="submit" disabled={loading || !authorizationCode}>
                              {loading ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Connecting...
                                </>
                              ) : (
                                'Complete Connection'
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setShowCodeInput(false)
                                setAuthUrl('')
                                setAuthorizationCode('')
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </div>
                    )}
                  </>
                )}

                {connectionStatus?.success && (
                  <div className="space-y-4">
                    <div className="rounded-md border border-green-200 bg-green-50 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <h3 className="font-medium text-green-900">Connection Active</h3>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowReconnectDialog(true)}
                        >
                          Reconnect
                        </Button>
                      </div>
                      <p className="text-sm text-green-700 mt-2">
                        Your Charm EHR connection is active and working properly.
                      </p>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Use the sidebar to configure user mappings, locations, and visit types.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* User Mapping Section */}
          {activeSection === 'users' && (
            <Card>
              <CardHeader>
                <CardTitle>User to Member Mapping</CardTitle>
                <CardDescription>
                  Map your Write Great Notes users to Charm Health members
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Charm Member</TableHead>
                        <TableHead className="w-[100px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            {user.first_name} {user.last_name}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Select
                              value={user.emr_settings?.member_id || 'none'}
                              onValueChange={(value) => handleUserMapping(user.id, value === 'none' ? '' : value)}
                            >
                              <SelectTrigger className="w-[250px]">
                                <SelectValue placeholder="Select Charm member" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No mapping</SelectItem>
                                {charmMembers.map((member, index) => {
                                  const memberId = member.id || member.member_id || ''
                                  const displayName = member.firstName && member.lastName
                                    ? `${member.firstName} ${member.lastName}`
                                    : (member.full_name || member.name || 'Unknown')
                                  return (
                                    <SelectItem
                                      key={`${user.id}-${memberId || index}`}
                                      value={memberId}
                                    >
                                      {displayName}
                                    </SelectItem>
                                  )
                                })}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {user.emr_settings?.member_id && (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}

          {/* Locations Section */}
          {activeSection === 'locations' && (
            <Card>
              <CardHeader>
                <CardTitle>Facility Mapping</CardTitle>
                <CardDescription>
                  Map your practice locations to Charm Health facilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingLocations ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Location Name</TableHead>
                        <TableHead>Charm Facility</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {locations.map((location) => (
                        <TableRow key={location.id}>
                          <TableCell className="font-medium">
                            {location.name}
                            {location.address && (
                              <div className="text-xs text-muted-foreground">{location.address}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={location.emr_settings?.facility_id || 'none'}
                              onValueChange={(value) => handleLocationMapping(location.id, value === 'none' ? '' : value)}
                            >
                              <SelectTrigger className="w-[250px]">
                                <SelectValue placeholder="Select facility" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No mapping</SelectItem>
                                {charmFacilities.map((facility, index) => (
                                  <SelectItem
                                    key={`${location.id}-${facility.facility_id || index}`}
                                    value={facility.facility_id}
                                  >
                                    {facility.facility_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {location.emr_settings?.facility_id && (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}

          {/* Visit Type Mapping Section */}
          {activeSection === 'visit-types' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Visit Type Mapping</CardTitle>
                    <CardDescription>
                      Map organization visit types to Charm visit types
                    </CardDescription>
                  </div>
                  {/* Inline toast messages for visit-types section */}
                  {error && (
                    <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive flex items-center gap-2">
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />
                      <span className="max-w-xs truncate">{error}</span>
                    </div>
                  )}
                  {success && (
                    <div className="rounded-md bg-green-50 px-3 py-2 text-xs text-green-700 flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                      <span className="max-w-xs truncate">{success}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loadingVisitTypes ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {visitTypes.map((visitType) => {
                      const mappedCharmIds = visitType.emr_settings?.charm_visit_type_ids || []
                      const mappedCharmTypes = charmVisitTypes.filter(ct =>
                        mappedCharmIds.includes(ct.visittype_id)
                      )

                      // Get all mapped charm IDs across ALL visit types (for uniqueness constraint)
                      const allMappedIds = visitTypes.flatMap(vt => vt.emr_settings?.charm_visit_type_ids || [])
                      const availableCharmTypes = charmVisitTypes.filter(
                        ct => !allMappedIds.includes(ct.visittype_id)
                      )

                      const selectedCharmType = selectedCharmTypes[visitType.id] || ''

                      return (
                        <div key={visitType.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{visitType.name}</h3>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {/* Show all mapped types with remove buttons */}
                            {mappedCharmTypes.length > 0 && (
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                {mappedCharmTypes.map((charmType) => (
                                  <Badge key={charmType.visittype_id} variant="secondary" className="flex items-center gap-2">
                                    {charmType.visittype_name}
                                    <button
                                      onClick={() => handleRemoveVisitTypeMapping(visitType.id, charmType.visittype_id)}
                                      className="hover:text-destructive"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Always show dropdown + Add button */}
                            <div className="flex items-center gap-2">
                              <Select
                                value={selectedCharmType}
                                onValueChange={(value) => {
                                  setSelectedCharmTypes(prev => ({
                                    ...prev,
                                    [visitType.id]: value
                                  }))
                                }}
                              >
                                <SelectTrigger className="w-[300px]">
                                  <SelectValue placeholder="Select Charm visit type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableCharmTypes.map((charmType, index) => (
                                    <SelectItem
                                      key={charmType.visittype_id || `visittype-${index}`}
                                      value={charmType.visittype_id || ''}
                                    >
                                      {charmType.visittype_name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                onClick={() => {
                                  if (selectedCharmType) {
                                    handleAddVisitTypeMapping(visitType.id, selectedCharmType)
                                    setSelectedCharmTypes(prev => {
                                      const newState = { ...prev }
                                      delete newState[visitType.id]
                                      return newState
                                    })
                                  }
                                }}
                                disabled={!selectedCharmType}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                              </Button>
                            </div>
                            {availableCharmTypes.length === 0 && (
                              <span className="text-sm text-muted-foreground">All Charm visit types are mapped</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Vitals Mapping Section */}
          {activeSection === 'vitals' && (
            <VitalsMappingSection />
          )}
        </main>
      </div>

      {/* Reconnect Confirmation Dialog */}
      <Dialog open={showReconnectDialog} onOpenChange={setShowReconnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reconnect to Charm EHR</DialogTitle>
            <DialogDescription>
              This will disconnect your current Charm EHR connection. To restore the connection, you will need:
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Your Charm API Key</li>
              <li>Your Charm Client ID</li>
              <li>Your Charm Client Secret</li>
            </ul>
            <p className="mt-4 text-sm font-medium text-destructive">
              Make sure you have these credentials ready before proceeding.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReconnectDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConnectionStatus(null)
                setShowCodeInput(false)
                setAuthorizationCode('')
                setAuthUrl('')
                setShowReconnectDialog(false)
              }}
            >
              Disconnect & Reconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
