'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiGet, apiPatch, apiPost, apiDelete, apiPut } from '@/lib/api-client'
import { AppLayout } from '@/components/AppLayout'
import { Pencil, Trash2, Plus, Building2, Users, MapPin, Calendar, Stethoscope, UserX, UserCheck, Activity, UserPlus, GripVertical, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { isAdmin, isProviderOrAdmin } from '@/lib/roles'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUserProfile } from '@/lib/use-user-profile'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { logger } from "@/lib/logger";
type OrganizationData = {
  name: string
  phone: string | null
  fax: string | null
  website: string | null
  address: {
    street: string | null
    city: string | null
    state: string | null
    zip: string | null
  } | null
}

type User = {
  id: string
  email: string
  roles: string[]
  created_at: string
  first_name?: string
  last_name?: string
  is_active: boolean
}

type Invitation = {
  id: string
  email: string
  first_name: string
  last_name: string
  roles: string[]
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  created_at: string
  expires_at: string
  accepted_at?: string
}

type Location = {
  id: string
  organization_id: string
  name: string
  address: string | null
  phone: string | null
  fax: string | null
  timezone: string
  emr_settings: Record<string, any>
  created_at: string
  updated_at: string
}

type LocationFormData = {
  name: string
  address: string
  phone: string
  fax: string
  timezone: string
}

type SidebarSection = 'details' | 'users' | 'locations' | 'visit-types' | 'diagnoses' | 'vital-signs' | 'referrals'

type VisitType = {
  id: string
  name: string
  duration_minutes: number
  is_active: boolean
  emr_settings: Record<string, any> | null
}

type Diagnosis = {
  name: string
}

type VitalMetric = {
  label: string
  key: string
  unit?: string
}

type VitalDefinition = {
  id: string
  name: string
  display_order: number
  is_pre_populated: boolean
  is_active: boolean
  metrics: VitalMetric[]
  display_format: string
  emr_mapping: Record<string, any>
}

type ReferralStatus = {
  id: string
  organization_id: string
  name: string
  display_order: number
  is_pre_configured: boolean
  is_read_only: boolean
  created_at: string
  updated_at: string
}

type ReferralSource = {
  id: string
  organization_id: string
  name: string
  display_order: number
  is_pre_configured: boolean
  requires_npi: boolean
  created_at: string
  updated_at: string
}

// Sortable Referral Status Component
function SortableReferralStatus({
  status,
  isReordering,
  onEdit,
  onDelete,
}: {
  status: ReferralStatus
  isReordering: boolean
  onEdit: (status: ReferralStatus) => void
  onDelete: (status: ReferralStatus) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: status.id,
    disabled: status.is_pre_configured // Disable dragging for pre-configured statuses
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start justify-between rounded-lg border p-4"
    >
      {isReordering && (
        <div
          {...attributes}
          {...listeners}
          className={status.is_pre_configured
            ? "mr-2 cursor-not-allowed opacity-50"
            : "mr-2 cursor-grab active:cursor-grabbing"
          }
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-base">{status.name}</h3>
          {status.is_pre_configured && (
            <Badge variant="secondary" className="text-xs">
              Pre-configured
            </Badge>
          )}
          {status.is_read_only && (
            <Badge variant="outline" className="text-xs">
              Read-only
            </Badge>
          )}
        </div>
      </div>
      {!isReordering && !status.is_read_only && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(status)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          {!status.is_pre_configured && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(status)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Referral Source Display Component
function ReferralSourceItem({
  source,
  onEdit,
  onDelete,
}: {
  source: ReferralSource
  onEdit: (source: ReferralSource) => void
  onDelete: (source: ReferralSource) => void
}) {
  return (
    <div className="flex items-start justify-between rounded-lg border p-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-base">{source.name}</h3>
          {source.is_pre_configured && (
            <Badge variant="secondary" className="text-xs">
              Pre-configured
            </Badge>
          )}
        </div>
      </div>
      {!source.is_pre_configured && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(source)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(source)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

function OrganizationSettingsContent() {
  const searchParams = useSearchParams()
  const sectionParam = searchParams.get('section') as SidebarSection | null
  const [activeSection, setActiveSection] = useState<SidebarSection>(
    sectionParam && ['details', 'users', 'locations', 'visit-types', 'diagnoses', 'vital-signs', 'referrals'].includes(sectionParam)
      ? sectionParam
      : 'details'
  )

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    fax: '',
    website: '',
    address_street: '',
    address_city: '',
    address_state: '',
    address_zip: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // Use SWR hook for user profile (instant render from cache, no shuffling)
  const { data: profile } = useUserProfile()

  // User management state
  const [users, setUsers] = useState<User[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteFirstName, setInviteFirstName] = useState('')
  const [inviteLastName, setInviteLastName] = useState('')
  const [inviteRoles, setInviteRoles] = useState<string[]>(['provider'])
  const [userError, setUserError] = useState('')
  const [userSuccess, setUserSuccess] = useState('')
  const [userLoading, setUserLoading] = useState(false)
  const [resendStatus, setResendStatus] = useState<Record<string, { type: 'success' | 'error', message: string }>>({})
  const [resendLoading, setResendLoading] = useState<Record<string, boolean>>({})

  // Delete invitation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [invitationToDelete, setInvitationToDelete] = useState<{ id: string; email: string } | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Role editing state
  const [isEditRolesDialogOpen, setIsEditRolesDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingRoles, setEditingRoles] = useState<string[]>([])
  const [roleError, setRoleError] = useState('')
  const [roleLoading, setRoleLoading] = useState(false)

  // User deactivation state
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false)
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null)
  const [deactivateLoading, setDeactivateLoading] = useState(false)

  // Locations management state
  const [locations, setLocations] = useState<Location[]>([])
  const [isCreateLocationDialogOpen, setIsCreateLocationDialogOpen] = useState(false)
  const [isEditLocationDialogOpen, setIsEditLocationDialogOpen] = useState(false)
  const [isDeleteLocationDialogOpen, setIsDeleteLocationDialogOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [locationFormData, setLocationFormData] = useState<LocationFormData>({
    name: '',
    address: '',
    phone: '',
    fax: '',
    timezone: 'America/New_York',
  })
  const [locationError, setLocationError] = useState('')
  const [locationLoading, setLocationLoading] = useState(false)

  // Visit Types management state
  const [visitTypes, setVisitTypes] = useState<VisitType[]>([])
  const [isCreateVisitTypeDialogOpen, setIsCreateVisitTypeDialogOpen] = useState(false)
  const [isEditVisitTypeDialogOpen, setIsEditVisitTypeDialogOpen] = useState(false)
  const [isDeleteVisitTypeDialogOpen, setIsDeleteVisitTypeDialogOpen] = useState(false)
  const [selectedVisitType, setSelectedVisitType] = useState<VisitType | null>(null)
  const [visitTypeFormData, setVisitTypeFormData] = useState({
    name: '',
    duration_minutes: '30',
  })
  const [visitTypeError, setVisitTypeError] = useState('')
  const [visitTypeLoading, setVisitTypeLoading] = useState(false)

  // Diagnoses management state
  const [diagnoses, setDiagnoses] = useState('')
  const [diagnosesError, setDiagnosesError] = useState('')
  const [diagnosesSuccess, setDiagnosesSuccess] = useState('')
  const [diagnosesLoading, setDiagnosesLoading] = useState(false)

  // Vital Signs management state
  const [vitalDefinitions, setVitalDefinitions] = useState<VitalDefinition[]>([])
  const [isCreateVitalDialogOpen, setIsCreateVitalDialogOpen] = useState(false)
  const [isEditVitalDialogOpen, setIsEditVitalDialogOpen] = useState(false)
  const [isDeleteVitalDialogOpen, setIsDeleteVitalDialogOpen] = useState(false)
  const [selectedVital, setSelectedVital] = useState<VitalDefinition | null>(null)
  const [vitalFormData, setVitalFormData] = useState({
    name: '',
    metrics: [] as VitalMetric[],
    display_format: ''
  })
  const [vitalError, setVitalError] = useState('')
  const [vitalLoading, setVitalLoading] = useState(false)

  // Referral Statuses management state
  const [referralStatuses, setReferralStatuses] = useState<ReferralStatus[]>([])
  const [isCreateStatusDialogOpen, setIsCreateStatusDialogOpen] = useState(false)
  const [isEditStatusDialogOpen, setIsEditStatusDialogOpen] = useState(false)
  const [isDeleteStatusDialogOpen, setIsDeleteStatusDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<ReferralStatus | null>(null)
  const [statusFormData, setStatusFormData] = useState({
    name: ''
  })
  const [statusError, setStatusError] = useState('')
  const [statusLoading, setStatusLoading] = useState(false)

  // Referral Sources management state
  const [referralSources, setReferralSources] = useState<ReferralSource[]>([])
  const [isCreateSourceDialogOpen, setIsCreateSourceDialogOpen] = useState(false)
  const [isEditSourceDialogOpen, setIsEditSourceDialogOpen] = useState(false)
  const [isDeleteSourceDialogOpen, setIsDeleteSourceDialogOpen] = useState(false)
  const [selectedSource, setSelectedSource] = useState<ReferralSource | null>(null)
  const [sourceFormData, setSourceFormData] = useState({
    name: ''
  })
  const [sourceError, setSourceError] = useState('')
  const [sourceLoading, setSourceLoading] = useState(false)

  // Drag-and-drop reordering state for Referral Statuses
  const [isReorderingStatuses, setIsReorderingStatuses] = useState(false)
  const [localStatuses, setLocalStatuses] = useState<ReferralStatus[]>([])
  const [hasUnsavedStatusChanges, setHasUnsavedStatusChanges] = useState(false)
  const [isSavingStatusOrder, setIsSavingStatusOrder] = useState(false)

  // Drag-and-drop reordering state for Referral Sources
  const [isReorderingSources, setIsReorderingSources] = useState(false)
  const [localSources, setLocalSources] = useState<ReferralSource[]>([])
  const [hasUnsavedSourceChanges, setHasUnsavedSourceChanges] = useState(false)
  const [isSavingSourceOrder, setIsSavingSourceOrder] = useState(false)

  // Drag-and-drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    // Fetch organization details
    const fetchOrganization = async () => {
      try {
        const data: OrganizationData = await apiGet('/organizations/me')
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          fax: data.fax || '',
          website: data.website || '',
          address_street: data.address?.street || '',
          address_city: data.address?.city || '',
          address_state: data.address?.state || '',
          address_zip: data.address?.zip || '',
        })
      } catch (err: any) {
        logger.error('Failed to fetch organization', err)
        setError(err.message)
      }
    }

    fetchOrganization()
    fetchUsers()
    fetchInvitations()
    fetchLocations()
    fetchVisitTypes()
    fetchDiagnoses()
    fetchVitalDefinitions()
    fetchReferralStatuses()
    fetchReferralSources()
  }, [])

  // Realtime subscription for invitations and users
  useEffect(() => {
    const supabase = createClient();
    // Subscribe to invitations table changes
    const invitationsChannel = supabase
      .channel('invitations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invitations'
        },
        () => {
          // Refresh invitations when any change occurs
          fetchInvitations()
        }
      )
      .subscribe()

    // Subscribe to users table changes
    const usersChannel = supabase
      .channel('users-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        () => {
          // Refresh users when any change occurs (new user from accepted invitation)
          fetchUsers()
        }
      )
      .subscribe()

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(invitationsChannel)
      supabase.removeChannel(usersChannel)
    }
  }, [])

  const fetchUsers = async () => {
    try {
      const data = await apiGet<User[]>('/users')
      setUsers(data)
    } catch (err: any) {
      logger.error('Failed to fetch users', err)
    }
  }

  const fetchInvitations = async () => {
    try {
      const data = await apiGet<Invitation[]>('/users/invitations')
      setInvitations(data)
    } catch (err: any) {
      logger.error('Failed to fetch invitations', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await apiPatch('/organizations/me', formData)
      setSuccess('Practice updated successfully')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setUserError('')
    setUserSuccess('')
    setUserLoading(true)

    try {
      await apiPost('/users/invite', {
        email: inviteEmail,
        first_name: inviteFirstName,
        last_name: inviteLastName,
        roles: inviteRoles
      })
      setUserSuccess(`Invitation sent to ${inviteEmail}`)
      setInviteEmail('')
      setInviteFirstName('')
      setInviteLastName('')
      setInviteRoles(['provider'])
      fetchInvitations()
    } catch (err: any) {
      setUserError(err.message || 'An error occurred')
    } finally {
      setUserLoading(false)
    }
  }

  const handleResendInvitation = async (invitationId: string, email: string) => {
    // Clear any previous status for this invitation
    setResendStatus(prev => {
      const updated = { ...prev }
      delete updated[invitationId]
      return updated
    })

    setResendLoading(prev => ({ ...prev, [invitationId]: true }))

    try {
      await apiPost(`/users/invitations/${invitationId}/resend`, {})
      setResendStatus(prev => ({
        ...prev,
        [invitationId]: { type: 'success', message: `Invitation resent to ${email}` }
      }))

      // Clear success message after 5 seconds
      setTimeout(() => {
        setResendStatus(prev => {
          const updated = { ...prev }
          delete updated[invitationId]
          return updated
        })
      }, 5000)
    } catch (err: any) {
      setResendStatus(prev => ({
        ...prev,
        [invitationId]: { type: 'error', message: err.message || 'Failed to resend invitation' }
      }))
    } finally {
      setResendLoading(prev => ({ ...prev, [invitationId]: false }))
    }
  }

  const handleDeleteInvitation = async () => {
    if (!invitationToDelete) return

    setDeleteLoading(true)
    setUserError('')
    setUserSuccess('')

    try {
      await apiDelete(`/users/invitations/${invitationToDelete.id}`)
      setUserSuccess(`Invitation to ${invitationToDelete.email} has been deleted`)
      setDeleteDialogOpen(false)
      setInvitationToDelete(null)

      // Refresh invitations list
      await fetchInvitations()

      // Clear success message after 5 seconds
      setTimeout(() => {
        setUserSuccess('')
      }, 5000)
    } catch (err: any) {
      setUserError(err.message || 'Failed to delete invitation')
    } finally {
      setDeleteLoading(false)
    }
  }

  const toggleInviteRole = (role: string) => {
    setInviteRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    )
  }

  // Role editing functions
  const openEditRolesDialog = (user: User) => {
    setSelectedUser(user)
    setEditingRoles([...user.roles])
    setRoleError('')
    setIsEditRolesDialogOpen(true)
  }

  const toggleRole = (role: string) => {
    setEditingRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    )
  }

  const handleUpdateRoles = async () => {
    if (!selectedUser) return

    if (editingRoles.length === 0) {
      setRoleError('User must have at least one role')
      return
    }

    setRoleError('')
    setRoleLoading(true)

    try {
      await apiPatch(`/users/${selectedUser.id}/roles`, { roles: editingRoles })
      setIsEditRolesDialogOpen(false)
      setSelectedUser(null)
      await fetchUsers()
    } catch (err: any) {
      setRoleError(err.message || 'Failed to update roles')
    } finally {
      setRoleLoading(false)
    }
  }

  // User deactivation functions
  const openDeactivateDialog = (user: User) => {
    setUserToDeactivate(user)
    setUserError('')
    setIsDeactivateDialogOpen(true)
  }

  const handleDeactivateUser = async () => {
    if (!userToDeactivate) return

    setDeactivateLoading(true)
    setUserError('')

    try {
      await apiPatch(`/users/${userToDeactivate.id}/status`, {
        is_active: !userToDeactivate.is_active
      })

      const action = userToDeactivate.is_active ? 'deactivated' : 'reactivated'
      setUserSuccess(`User ${userToDeactivate.email} has been ${action}`)
      setIsDeactivateDialogOpen(false)
      setUserToDeactivate(null)

      // Refresh users list
      await fetchUsers()

      // Clear success message after 5 seconds
      setTimeout(() => {
        setUserSuccess('')
      }, 5000)
    } catch (err: any) {
      setUserError(err.message || 'Failed to update user status')
    } finally {
      setDeactivateLoading(false)
    }
  }

  // Location management functions
  const fetchLocations = async () => {
    try {
      const data = await apiGet<Location[]>('/locations')
      setLocations(data)
    } catch (err: any) {
      logger.error('Failed to fetch locations', err)
    }
  }

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocationError('')
    setLocationLoading(true)

    try {
      await apiPost('/locations', locationFormData)
      setIsCreateLocationDialogOpen(false)
      setLocationFormData({ name: '', address: '', phone: '', fax: '', timezone: 'America/New_York' })
      await fetchLocations()
    } catch (err: any) {
      setLocationError(err.message || 'Failed to create location')
    } finally {
      setLocationLoading(false)
    }
  }

  const handleEditLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLocation) return

    setLocationError('')
    setLocationLoading(true)

    try {
      await apiPatch(`/locations/${selectedLocation.id}`, locationFormData)
      setIsEditLocationDialogOpen(false)
      setSelectedLocation(null)
      setLocationFormData({ name: '', address: '', phone: '', fax: '', timezone: 'America/New_York' })
      await fetchLocations()
    } catch (err: any) {
      setLocationError(err.message || 'Failed to update location')
    } finally {
      setLocationLoading(false)
    }
  }

  const handleDeleteLocation = async () => {
    if (!selectedLocation) return

    setLocationLoading(true)

    try {
      await apiDelete(`/locations/${selectedLocation.id}`)
      setIsDeleteLocationDialogOpen(false)
      setSelectedLocation(null)
      await fetchLocations()
    } catch (err: any) {
      setLocationError(err.message || 'Failed to delete location')
    } finally {
      setLocationLoading(false)
    }
  }

  const openCreateLocationDialog = () => {
    setLocationFormData({ name: '', address: '', phone: '', fax: '', timezone: 'America/New_York' })
    setLocationError('')
    setIsCreateLocationDialogOpen(true)
  }

  const openEditLocationDialog = (location: Location) => {
    setSelectedLocation(location)
    setLocationFormData({
      name: location.name,
      address: location.address || '',
      phone: location.phone || '',
      fax: location.fax || '',
      timezone: location.timezone || 'America/New_York',
    })
    setLocationError('')
    setIsEditLocationDialogOpen(true)
  }

  const openDeleteLocationDialog = (location: Location) => {
    setSelectedLocation(location)
    setLocationError('')
    setIsDeleteLocationDialogOpen(true)
  }

  // Visit Types management functions
  const fetchVisitTypes = async () => {
    try {
      const data = await apiGet<VisitType[]>('/visit-types')
      setVisitTypes(data.filter(vt => vt.is_active))
    } catch (err: any) {
      logger.error('Failed to fetch visit types', err)
    }
  }

  const handleCreateVisitType = async (e: React.FormEvent) => {
    e.preventDefault()
    setVisitTypeError('')
    setVisitTypeLoading(true)

    try {
      await apiPost('/visit-types', {
        name: visitTypeFormData.name,
        duration_minutes: parseInt(visitTypeFormData.duration_minutes),
      })
      setIsCreateVisitTypeDialogOpen(false)
      setVisitTypeFormData({ name: '', duration_minutes: '30' })
      await fetchVisitTypes()
    } catch (err: any) {
      setVisitTypeError(err.message || 'Failed to create visit type')
    } finally {
      setVisitTypeLoading(false)
    }
  }

  const handleEditVisitType = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVisitType) return

    setVisitTypeError('')
    setVisitTypeLoading(true)

    try {
      await apiPatch(`/visit-types/${selectedVisitType.id}`, {
        name: visitTypeFormData.name,
        duration_minutes: parseInt(visitTypeFormData.duration_minutes),
      })
      setIsEditVisitTypeDialogOpen(false)
      setSelectedVisitType(null)
      setVisitTypeFormData({ name: '', duration_minutes: '30' })
      await fetchVisitTypes()
    } catch (err: any) {
      setVisitTypeError(err.message || 'Failed to update visit type')
    } finally {
      setVisitTypeLoading(false)
    }
  }

  const handleDeleteVisitType = async () => {
    if (!selectedVisitType) return

    setVisitTypeLoading(true)

    try {
      await apiDelete(`/visit-types/${selectedVisitType.id}`)
      setIsDeleteVisitTypeDialogOpen(false)
      setSelectedVisitType(null)
      await fetchVisitTypes()
    } catch (err: any) {
      setVisitTypeError(err.message || 'Failed to delete visit type')
    } finally {
      setVisitTypeLoading(false)
    }
  }

  const openCreateVisitTypeDialog = () => {
    setVisitTypeFormData({ name: '', duration_minutes: '30' })
    setVisitTypeError('')
    setIsCreateVisitTypeDialogOpen(true)
  }

  const openEditVisitTypeDialog = (visitType: VisitType) => {
    setSelectedVisitType(visitType)
    setVisitTypeFormData({
      name: visitType.name,
      duration_minutes: String(visitType.duration_minutes),
    })
    setVisitTypeError('')
    setIsEditVisitTypeDialogOpen(true)
  }

  const openDeleteVisitTypeDialog = (visitType: VisitType) => {
    setSelectedVisitType(visitType)
    setVisitTypeError('')
    setIsDeleteVisitTypeDialogOpen(true)
  }

  // Diagnoses management functions
  const fetchDiagnoses = async () => {
    try {
      const data = await apiGet<Diagnosis[]>('/diagnoses')
      setDiagnoses(data.map((d) => d.name).join('\n'))
    } catch (err: any) {
      logger.error('Failed to fetch diagnoses', err)
    }
  }

  const handleDiagnosesSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setDiagnosesError('')
    setDiagnosesSuccess('')
    setDiagnosesLoading(true)

    try {
      const diagnosesArray = diagnoses
        .split('\n')
        .map((d) => d.trim())
        .filter((d) => d.length > 0)

      await apiPut('/diagnoses', { diagnoses: diagnosesArray })
      setDiagnosesSuccess('Diagnoses updated successfully')
    } catch (err: any) {
      setDiagnosesError(err.message || 'An error occurred')
    } finally {
      setDiagnosesLoading(false)
    }
  }

  // Vital Definitions management functions
  const fetchVitalDefinitions = async () => {
    try {
      const data = await apiGet<{ vital_definitions: VitalDefinition[] }>('/vital-definitions')
      // Defensive check: ensure vital_definitions is an array before filtering
      if (data && Array.isArray(data.vital_definitions)) {
        setVitalDefinitions(data.vital_definitions.filter(vd => vd.is_active))
      } else {
        logger.error('Invalid vital_definitions response:', data)
        setVitalDefinitions([])
      }
    } catch (err: any) {
      logger.error('Failed to fetch vital definitions', err)
      setVitalDefinitions([]) // Set empty array on error
    }
  }

  const handleCreateVital = async (e: React.FormEvent) => {
    e.preventDefault()
    setVitalError('')

    // Validate that we have at least one metric
    if (vitalFormData.metrics.length === 0) {
      setVitalError('Please add at least one metric')
      return
    }

    // Validate display format
    if (!vitalFormData.display_format) {
      setVitalError('Please enter a display format')
      return
    }

    setVitalLoading(true)

    try {
      await apiPost('/vital-definitions', {
        name: vitalFormData.name,
        metrics: vitalFormData.metrics,
        display_format: vitalFormData.display_format,
      })
      setIsCreateVitalDialogOpen(false)
      setVitalFormData({ name: '', metrics: [], display_format: '' })
      await fetchVitalDefinitions()
    } catch (err: any) {
      setVitalError(err.message || 'Failed to create vital definition')
    } finally {
      setVitalLoading(false)
    }
  }

  const handleEditVital = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVital) return

    setVitalError('')

    // Validate that we have at least one metric
    if (vitalFormData.metrics.length === 0) {
      setVitalError('Please add at least one metric')
      return
    }

    // Validate display format
    if (!vitalFormData.display_format) {
      setVitalError('Please enter a display format')
      return
    }

    setVitalLoading(true)

    try {
      await apiPatch(`/vital-definitions/${selectedVital.id}`, {
        name: vitalFormData.name,
        metrics: vitalFormData.metrics,
        display_format: vitalFormData.display_format,
      })
      setIsEditVitalDialogOpen(false)
      setSelectedVital(null)
      setVitalFormData({ name: '', metrics: [], display_format: '' })
      await fetchVitalDefinitions()
    } catch (err: any) {
      setVitalError(err.message || 'Failed to update vital definition')
    } finally {
      setVitalLoading(false)
    }
  }

  const handleDeleteVital = async () => {
    if (!selectedVital) return

    setVitalLoading(true)

    try {
      await apiDelete(`/vital-definitions/${selectedVital.id}`)
      setIsDeleteVitalDialogOpen(false)
      setSelectedVital(null)
      await fetchVitalDefinitions()
    } catch (err: any) {
      setVitalError(err.message || 'Failed to delete vital definition')
    } finally {
      setVitalLoading(false)
    }
  }

  const openCreateVitalDialog = () => {
    setVitalFormData({ name: '', metrics: [], display_format: '' })
    setVitalError('')
    setIsCreateVitalDialogOpen(true)
  }

  const openEditVitalDialog = (vital: VitalDefinition) => {
    setSelectedVital(vital)
    setVitalFormData({
      name: vital.name,
      metrics: vital.metrics || [],
      display_format: vital.display_format || '',
    })
    setVitalError('')
    setIsEditVitalDialogOpen(true)
  }

  const openDeleteVitalDialog = (vital: VitalDefinition) => {
    setSelectedVital(vital)
    setVitalError('')
    setIsDeleteVitalDialogOpen(true)
  }

  // Referral Status Functions
  const fetchReferralStatuses = async () => {
    try {
      const data = await apiGet<ReferralStatus[]>('/referral-statuses')
      setReferralStatuses(data)
    } catch (err: any) {
      logger.error('Failed to fetch referral statuses', err)
      setReferralStatuses([])
    }
  }

  const handleCreateStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatusError('')
    setStatusLoading(true)

    try {
      // Calculate display_order: Find max display_order among non-pre-configured statuses and add 1
      // This ensures new status goes after existing user statuses but before Inactive (10000) and Converted (10001)
      // "New" is at position 0, so user statuses start at position 1
      const userStatuses = referralStatuses.filter(s => !s.is_pre_configured)
      let newOrder: number

      if (userStatuses.length === 0) {
        // No user statuses yet, start at 1 (after "New" at position 0)
        newOrder = 1
      } else {
        // Add 1 to the highest user status display_order
        const maxUserOrder = Math.max(...userStatuses.map(s => s.display_order))
        newOrder = maxUserOrder + 1
      }

      await apiPost('/referral-statuses', {
        ...statusFormData,
        display_order: newOrder
      })
      setIsCreateStatusDialogOpen(false)
      setStatusFormData({ name: '' })
      await fetchReferralStatuses()
    } catch (err: any) {
      setStatusError(err.message || 'Failed to create referral status')
    } finally {
      setStatusLoading(false)
    }
  }

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStatus) return
    setStatusError('')
    setStatusLoading(true)

    try {
      await apiPatch(`/referral-statuses/${selectedStatus.id}`, statusFormData)
      setIsEditStatusDialogOpen(false)
      setSelectedStatus(null)
      await fetchReferralStatuses()
    } catch (err: any) {
      setStatusError(err.message || 'Failed to update referral status')
    } finally {
      setStatusLoading(false)
    }
  }

  const handleDeleteStatus = async () => {
    if (!selectedStatus) return
    setStatusLoading(true)

    try {
      await apiDelete(`/referral-statuses/${selectedStatus.id}`)
      setIsDeleteStatusDialogOpen(false)
      setSelectedStatus(null)
      await fetchReferralStatuses()
    } catch (err: any) {
      setStatusError(err.message || 'Failed to delete referral status')
    } finally {
      setStatusLoading(false)
    }
  }

  const openCreateStatusDialog = () => {
    setStatusFormData({ name: '' })
    setStatusError('')
    setIsCreateStatusDialogOpen(true)
  }

  const openEditStatusDialog = (status: ReferralStatus) => {
    setSelectedStatus(status)
    setStatusFormData({
      name: status.name
    })
    setStatusError('')
    setIsEditStatusDialogOpen(true)
  }

  const openDeleteStatusDialog = (status: ReferralStatus) => {
    setSelectedStatus(status)
    setStatusError('')
    setIsDeleteStatusDialogOpen(true)
  }

  // Referral Source Functions
  const fetchReferralSources = async () => {
    try {
      const data = await apiGet<ReferralSource[]>('/referral-sources')
      setReferralSources(data)
    } catch (err: any) {
      logger.error('Failed to fetch referral sources', err)
      setReferralSources([])
    }
  }

  const handleCreateSource = async (e: React.FormEvent) => {
    e.preventDefault()
    setSourceError('')
    setSourceLoading(true)

    try {
      // Calculate next display_order
      const maxOrder = referralSources.length > 0
        ? Math.max(...referralSources.map(s => s.display_order))
        : 0

      await apiPost('/referral-sources', {
        ...sourceFormData,
        display_order: maxOrder + 1
      })
      setIsCreateSourceDialogOpen(false)
      setSourceFormData({ name: '' })
      await fetchReferralSources()
    } catch (err: any) {
      setSourceError(err.message || 'Failed to create referral source')
    } finally {
      setSourceLoading(false)
    }
  }

  const handleUpdateSource = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSource) return
    setSourceError('')
    setSourceLoading(true)

    try {
      await apiPatch(`/referral-sources/${selectedSource.id}`, sourceFormData)
      setIsEditSourceDialogOpen(false)
      setSelectedSource(null)
      await fetchReferralSources()
    } catch (err: any) {
      setSourceError(err.message || 'Failed to update referral source')
    } finally {
      setSourceLoading(false)
    }
  }

  const handleDeleteSource = async () => {
    if (!selectedSource) return
    setSourceLoading(true)

    try {
      await apiDelete(`/referral-sources/${selectedSource.id}`)
      setIsDeleteSourceDialogOpen(false)
      setSelectedSource(null)
      await fetchReferralSources()
    } catch (err: any) {
      setSourceError(err.message || 'Failed to delete referral source')
    } finally {
      setSourceLoading(false)
    }
  }

  const openCreateSourceDialog = () => {
    setSourceFormData({ name: '' })
    setSourceError('')
    setIsCreateSourceDialogOpen(true)
  }

  const openEditSourceDialog = (source: ReferralSource) => {
    setSelectedSource(source)
    setSourceFormData({
      name: source.name
    })
    setSourceError('')
    setIsEditSourceDialogOpen(true)
  }

  const openDeleteSourceDialog = (source: ReferralSource) => {
    setSelectedSource(source)
    setSourceError('')
    setIsDeleteSourceDialogOpen(true)
  }

  // Referral Status Reordering Handlers
  const handleToggleReorderingStatuses = () => {
    if (isReorderingStatuses) {
      // Cancel reordering
      setIsReorderingStatuses(false)
      setLocalStatuses([])
      setHasUnsavedStatusChanges(false)
    } else {
      // Start reordering
      setIsReorderingStatuses(true)
      setLocalStatuses([...referralStatuses])
      setHasUnsavedStatusChanges(false)
    }
  }

  const handleStatusDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setLocalStatuses((statuses) => {
      const oldIndex = statuses.findIndex((s) => s.id === active.id)
      const newIndex = statuses.findIndex((s) => s.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return statuses

      const draggedStatus = statuses[oldIndex]
      if (!draggedStatus) return statuses

      // Enforce pre-configured status position constraints:
      // - "New" must be first (index 0)
      // - "Inactive" must be second-to-last (index length-2)
      // - "Converted" must be last (index length-1)

      // Prevent dragging pre-configured statuses to invalid positions
      if (draggedStatus.is_pre_configured) {
        if (draggedStatus.name === 'New' && newIndex !== 0) {
          return statuses // New must stay at position 0
        }
        if (draggedStatus.name === 'Inactive' && newIndex !== statuses.length - 2) {
          return statuses // Inactive must stay at second-to-last
        }
        if (draggedStatus.name === 'Converted' && newIndex !== statuses.length - 1) {
          return statuses // Converted must stay at last position
        }
      }

      // Prevent dragging other statuses to pre-configured positions
      if (!draggedStatus.is_pre_configured) {
        if (newIndex === 0 || newIndex === statuses.length - 2 || newIndex === statuses.length - 1) {
          return statuses // Cannot move to positions reserved for pre-configured statuses
        }
      }

      setHasUnsavedStatusChanges(true)
      return arrayMove(statuses, oldIndex, newIndex)
    })
  }

  const handleSaveStatusOrder = async () => {
    setIsSavingStatusOrder(true)
    try {
      // Only update user-created statuses that have changed position
      // Assign sequential positions starting from 1
      let userStatusPosition = 1
      const updates = localStatuses
        .filter(status => !status.is_pre_configured)
        .map((status) => {
          const newOrder = userStatusPosition++
          return {
            status_id: status.id,
            new_order: newOrder,
            old_order: status.display_order
          }
        })
        .filter(update => update.new_order !== update.old_order)
        .map(({ status_id, new_order }) => ({ status_id, new_order }))

      // Only send update if there are changes
      if (updates.length === 0) {
        setIsReorderingStatuses(false)
        setLocalStatuses([])
        setHasUnsavedStatusChanges(false)
        setIsSavingStatusOrder(false)
        return
      }

      // Send batch update to backend
      await apiPatch('/referral-statuses/reorder-batch', { updates })

      // Reload statuses from backend
      await fetchReferralStatuses()
    } catch (err: any) {
      setStatusError(err.message || 'Failed to save status order')
      setTimeout(() => setStatusError(''), 5000)
    } finally {
      // Always exit reordering mode and reset state
      setIsSavingStatusOrder(false)
      setIsReorderingStatuses(false)
      setLocalStatuses([])
      setHasUnsavedStatusChanges(false)
    }
  }

  // Referral Source Reordering Handlers
  const handleToggleReorderingSources = () => {
    if (isReorderingSources) {
      // Cancel reordering
      setIsReorderingSources(false)
      setLocalSources([])
      setHasUnsavedSourceChanges(false)
    } else {
      // Start reordering
      setIsReorderingSources(true)
      setLocalSources([...referralSources])
      setHasUnsavedSourceChanges(false)
    }
  }

  const handleSourceDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setLocalSources((sources) => {
      const oldIndex = sources.findIndex((s) => s.id === active.id)
      const newIndex = sources.findIndex((s) => s.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return sources

      setHasUnsavedSourceChanges(true)
      return arrayMove(sources, oldIndex, newIndex)
    })
  }

  const handleSaveSourceOrder = async () => {
    setIsSavingSourceOrder(true)
    try {
      // Build update payload with new order numbers
      const updates = localSources.map((source, index) => ({
        source_id: source.id,
        new_order: index + 1
      }))

      // Send batch update to backend
      await apiPatch('/referral-sources/reorder-batch', { updates })

      // Reload sources from backend
      await fetchReferralSources()

      setIsReorderingSources(false)
      setLocalSources([])
      setHasUnsavedSourceChanges(false)
    } catch (err: any) {
      setSourceError(err.message || 'Failed to save source order')
      setTimeout(() => setSourceError(''), 5000)
    } finally {
      setIsSavingSourceOrder(false)
    }
  }

  return (
    <AppLayout>
      <Tabs value={activeSection} onValueChange={(v) => setActiveSection(v as SidebarSection)} className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
          <TabsTrigger
            value="details"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Building2 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Practice Details</span>
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger
            value="locations"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <MapPin className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Locations</span>
          </TabsTrigger>
          <TabsTrigger
            value="visit-types"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Calendar className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Visit Types</span>
          </TabsTrigger>
          <TabsTrigger
            value="diagnoses"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Stethoscope className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Diagnoses</span>
          </TabsTrigger>
          <TabsTrigger
            value="vital-signs"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Activity className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Vital Signs</span>
          </TabsTrigger>
          <TabsTrigger
            value="referrals"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Referrals</span>
          </TabsTrigger>
        </TabsList>

        {/* Practice Details Section */}
        <TabsContent value="details">
        <Card>
        <CardHeader>
          <CardTitle>Practice Details</CardTitle>
          <CardDescription>
            Update your practice's information
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Practice Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Practice Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="ABC Medical Clinic"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* Contact Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fax">Fax</Label>
                <Input
                  id="fax"
                  type="tel"
                  placeholder="(555) 123-4568"
                  value={formData.fax}
                  onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="text"
                placeholder="www.example.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>

            {/* Address Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Address</h3>

              <div className="space-y-2">
                <Label htmlFor="address_street">Street Address</Label>
                <Input
                  id="address_street"
                  type="text"
                  placeholder="123 Main St, Suite 100"
                  value={formData.address_street}
                  onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="address_city">City</Label>
                  <Input
                    id="address_city"
                    type="text"
                    placeholder="San Francisco"
                    value={formData.address_city}
                    onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_state">State</Label>
                  <Input
                    id="address_state"
                    type="text"
                    placeholder="CA"
                    maxLength={2}
                    value={formData.address_state}
                    onChange={(e) => setFormData({ ...formData, address_state: e.target.value.toUpperCase() })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_zip">ZIP Code</Label>
                  <Input
                    id="address_zip"
                    type="text"
                    placeholder="94102"
                    value={formData.address_zip}
                    onChange={(e) => setFormData({ ...formData, address_zip: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                {success}
              </div>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </form>
      </Card>
        </TabsContent>

          {/* Users Section */}
        <TabsContent value="users">
          <>
        {isAdmin(profile?.roles || []) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Invite User</CardTitle>
              <CardDescription>
                Invite a new user to your practice
              </CardDescription>
            </CardHeader>
          <form onSubmit={handleInvite}>
            <CardContent className="space-y-4">
              {/* Row 1: Email and Roles */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Email *</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="user@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Roles *</Label>
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="role-provider"
                        checked={inviteRoles.includes('provider')}
                        onCheckedChange={() => toggleInviteRole('provider')}
                      />
                      <label
                        htmlFor="role-provider"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Provider
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="role-admin"
                        checked={inviteRoles.includes('admin')}
                        onCheckedChange={() => toggleInviteRole('admin')}
                      />
                      <label
                        htmlFor="role-admin"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Admin
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="role-staff"
                        checked={inviteRoles.includes('staff')}
                        onCheckedChange={() => toggleInviteRole('staff')}
                      />
                      <label
                        htmlFor="role-staff"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Staff
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              {/* Row 2: First Name and Last Name */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="invite-first-name">First Name *</Label>
                  <Input
                    id="invite-first-name"
                    type="text"
                    placeholder="John"
                    value={inviteFirstName}
                    onChange={(e) => setInviteFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-last-name">Last Name *</Label>
                  <Input
                    id="invite-last-name"
                    type="text"
                    placeholder="Doe"
                    value={inviteLastName}
                    onChange={(e) => setInviteLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              {userError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {userError}
                </div>
              )}
              {userSuccess && (
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                  {userSuccess}
                </div>
              )}
              <Button type="submit" disabled={userLoading || inviteRoles.length === 0}>
                {userLoading ? 'Sending invitation...' : 'Send Invitation'}
              </Button>
            </CardContent>
          </form>
        </Card>
        )}

      {/* Pending Invitations */}
      {invitations.filter(inv => inv.status === 'pending').length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>
              Users who have been invited but haven't accepted yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invitations
                .filter(inv => inv.status === 'pending')
                .map((invitation) => (
                  <div key={invitation.id} className="space-y-2">
                    <div className="flex items-center justify-between rounded-md border p-3 bg-muted/50">
                      <div className="flex-1">
                        <p className="font-medium">{invitation.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {invitation.first_name} {invitation.last_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            Invited {new Date(invitation.created_at).toLocaleDateString()}
                          </p>
                          <span className="text-xs text-muted-foreground">•</span>
                          <button
                            onClick={() => handleResendInvitation(invitation.id, invitation.email)}
                            disabled={resendLoading[invitation.id]}
                            className="text-xs text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {resendLoading[invitation.id] ? 'Resending...' : 'Resend Invitation'}
                          </button>
                          <span className="text-xs text-muted-foreground">•</span>
                          <button
                            onClick={() => {
                              setInvitationToDelete({ id: invitation.id, email: invitation.email })
                              setDeleteDialogOpen(true)
                            }}
                            className="text-xs text-destructive hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-2">
                          {invitation.roles?.map((role) => (
                            <Badge
                              key={role}
                              variant={role === 'admin' ? 'default' : 'secondary'}
                            >
                              {role}
                            </Badge>
                          ))}
                        </div>
                        <Badge variant="outline" className="ml-2">
                          Invite Sent
                        </Badge>
                      </div>
                    </div>
                    {resendStatus[invitation.id] && (() => {
                      const status = resendStatus[invitation.id];
                      if (!status) return null;
                      return (
                        <div className={`rounded-md p-3 text-sm ${
                          status.type === 'success'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-destructive/10 text-destructive'
                        }`}>
                          {status.message}
                        </div>
                      );
                    })()}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Practice Users</CardTitle>
          <CardDescription>
            Manage users in your practice
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users found</p>
            ) : (
              <div className="space-y-2">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className={cn(
                      "flex items-center justify-between rounded-md border p-3",
                      !u.is_active && "opacity-60 bg-muted/50"
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{u.email}</p>
                        {!u.is_active && (
                          <Badge variant="destructive" className="text-xs">
                            Deactivated
                          </Badge>
                        )}
                      </div>
                      {(u.first_name || u.last_name) && (
                        <p className="text-sm text-muted-foreground">
                          {u.first_name} {u.last_name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-2">
                        {u.roles?.map((role) => (
                          <Badge
                            key={role}
                            variant={role === 'admin' ? 'default' : 'secondary'}
                          >
                            {role}
                          </Badge>
                        ))}
                      </div>
                      {isAdmin(profile?.roles || []) && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditRolesDialog(u)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={u.is_active ? "outline" : "default"}
                            size="sm"
                            onClick={() => openDeactivateDialog(u)}
                            title={u.is_active ? "Deactivate user" : "Reactivate user"}
                          >
                            {u.is_active ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
            </>
        </TabsContent>

          {/* Locations Section */}
        <TabsContent value="locations">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Practice Locations</CardTitle>
              <CardDescription>
                Manage your practice locations and their contact information
              </CardDescription>
            </div>
            <Button onClick={openCreateLocationDialog} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {locations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">No locations found</p>
              <Button onClick={openCreateLocationDialog} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Location
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {locations.map((location) => (
                <div
                  key={location.id}
                  className="flex items-start justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-2">{location.name}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {location.address && <p>{location.address}</p>}
                      {location.phone && <p>Phone: {location.phone}</p>}
                      {location.fax && <p>Fax: {location.fax}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditLocationDialog(location)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteLocationDialog(location)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

          {/* Visit Types Section */}
        <TabsContent value="visit-types">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Visit Types</CardTitle>
              <CardDescription className="mt-1">
                Manage appointment visit types that are <strong>available for the entire practice</strong>
              </CardDescription>
            </div>
            <Button onClick={openCreateVisitTypeDialog} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Visit Type
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {visitTypes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">No visit types found</p>
              <Button onClick={openCreateVisitTypeDialog} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Visit Type
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {visitTypes.map((visitType) => (
                <div
                  key={visitType.id}
                  className="flex items-start justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-2">
                      {visitType.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Duration: {visitType.duration_minutes} minutes
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditVisitTypeDialog(visitType)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteVisitTypeDialog(visitType)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        {/* Diagnoses Section */}
        <TabsContent value="diagnoses">
        <Card>
          <CardHeader>
            <CardTitle>Organization Diagnoses List</CardTitle>
            <CardDescription>
              Limit the diagnoses that are assigned to patient encounters to only these values. Leaving this list blank allows all diagnoses to be assigned.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleDiagnosesSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="diagnoses">Diagnoses (one per line)</Label>
                <textarea
                  id="diagnoses"
                  placeholder={"- Prediabetes (R73.03)\n- Type 2 diabetes mellitus without complications (E11.9)"}
                  value={diagnoses}
                  onChange={(e) => setDiagnoses(e.target.value)}
                  rows={20}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                />
                <p className="text-sm text-muted-foreground">
                  The AI note generation will limit the allowed diagnoses to only those on this list.
                </p>
              </div>

              {diagnosesError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {diagnosesError}
                </div>
              )}
              {diagnosesSuccess && (
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                  {diagnosesSuccess}
                </div>
              )}
              <Button type="submit" disabled={diagnosesLoading}>
                {diagnosesLoading ? 'Saving...' : 'Save Diagnoses'}
              </Button>
            </CardContent>
          </form>
        </Card>
        </TabsContent>

        {/* Vital Signs Section */}
        <TabsContent value="vital-signs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Vital Signs Tracking</CardTitle>
                  <CardDescription>
                    Configure which vital signs your practice tracks. Supports multi-metric vitals like Blood Pressure (systolic/diastolic).
                  </CardDescription>
                </div>
                <Button onClick={openCreateVitalDialog} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vital Sign
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {vitalDefinitions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-4">No vital signs configured</p>
                  <Button onClick={openCreateVitalDialog} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Vital Sign
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {vitalDefinitions.map((vital) => (
                    <div
                      key={vital.id}
                      className="flex items-start justify-between rounded-lg border p-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base">{vital.name}</h3>
                          {vital.is_pre_populated && (
                            <Badge variant="secondary" className="text-xs">
                              Pre-configured
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          {/* Display Metrics */}
                          {vital.metrics && vital.metrics.length > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">Metrics:</span>
                              <div className="flex flex-wrap gap-1">
                                {vital.metrics.map((metric, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {metric.label} ({metric.unit})
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Display Format */}
                          {vital.display_format && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">Format:</span>
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {vital.display_format}
                              </code>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {/* Edit and Delete buttons only for custom (non-pre-populated) vitals */}
                        {!vital.is_pre_populated && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditVitalDialog(vital)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteVitalDialog(vital)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referrals Configuration Section */}
        <TabsContent value="referrals">
          <div className="space-y-6">
            {/* Referral Statuses Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Referral Statuses</CardTitle>
                    <CardDescription>
                      Configure the status pipeline for tracking referrals through your workflow
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {referralStatuses.length > 0 && (
                      <>
                        {!isReorderingStatuses ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleToggleReorderingStatuses}
                          >
                            <GripVertical className="h-4 w-4 mr-2" />
                            Change Order
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={handleSaveStatusOrder}
                              disabled={!hasUnsavedStatusChanges || isSavingStatusOrder}
                            >
                              {isSavingStatusOrder ? (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Save Order
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleToggleReorderingStatuses}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                      </>
                    )}
                    {!isReorderingStatuses && (
                      <Button onClick={openCreateStatusDialog} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Status
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {referralStatuses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground mb-4">No referral statuses configured</p>
                    <Button onClick={openCreateStatusDialog} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Status
                    </Button>
                  </div>
                ) : isReorderingStatuses ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleStatusDragEnd}
                  >
                    <SortableContext
                      items={localStatuses.map(s => s.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {localStatuses.map((status) => (
                          <SortableReferralStatus
                            key={status.id}
                            status={status}
                            isReordering={isReorderingStatuses}
                            onEdit={openEditStatusDialog}
                            onDelete={openDeleteStatusDialog}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <div className="space-y-2">
                    {referralStatuses
                      .sort((a, b) => a.display_order - b.display_order)
                      .map((status) => (
                        <SortableReferralStatus
                          key={status.id}
                          status={status}
                          isReordering={isReorderingStatuses}
                          onEdit={openEditStatusDialog}
                          onDelete={openDeleteStatusDialog}
                        />
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Referral Sources Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Referral Sources</CardTitle>
                    <CardDescription>
                      Configure where your referrals come from (displayed alphabetically)
                    </CardDescription>
                  </div>
                  <Button onClick={openCreateSourceDialog} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Source
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {referralSources.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground mb-4">No referral sources configured</p>
                    <Button onClick={openCreateSourceDialog} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Source
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {referralSources
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((source) => (
                        <ReferralSourceItem
                          key={source.id}
                          source={source}
                          onEdit={openEditSourceDialog}
                          onDelete={openDeleteSourceDialog}
                        />
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Location Dialog */}
      <Dialog open={isCreateLocationDialogOpen} onOpenChange={setIsCreateLocationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
            <DialogDescription>
              Create a new practice location with contact information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateLocation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-location-name">Location Name *</Label>
              <Input
                id="create-location-name"
                type="text"
                placeholder="Main Office"
                value={locationFormData.name}
                onChange={(e) => setLocationFormData({ ...locationFormData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-location-address">Address</Label>
              <Input
                id="create-location-address"
                type="text"
                placeholder="123 Main St, Suite 100, City, State ZIP"
                value={locationFormData.address}
                onChange={(e) => setLocationFormData({ ...locationFormData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-location-phone">Phone</Label>
              <Input
                id="create-location-phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={locationFormData.phone}
                onChange={(e) => setLocationFormData({ ...locationFormData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-location-fax">Fax</Label>
              <Input
                id="create-location-fax"
                type="tel"
                placeholder="(555) 123-4568"
                value={locationFormData.fax}
                onChange={(e) => setLocationFormData({ ...locationFormData, fax: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-location-timezone">Timezone *</Label>
              <Select
                value={locationFormData.timezone}
                onValueChange={(value) => setLocationFormData({ ...locationFormData, timezone: value })}
              >
                <SelectTrigger id="create-location-timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern (America/New_York)</SelectItem>
                  <SelectItem value="America/Chicago">Central (America/Chicago)</SelectItem>
                  <SelectItem value="America/Denver">Mountain (America/Denver)</SelectItem>
                  <SelectItem value="America/Phoenix">Arizona (America/Phoenix)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific (America/Los_Angeles)</SelectItem>
                  <SelectItem value="America/Anchorage">Alaska (America/Anchorage)</SelectItem>
                  <SelectItem value="Pacific/Honolulu">Hawaii (Pacific/Honolulu)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {locationError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {locationError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateLocationDialogOpen(false)}
                disabled={locationLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={locationLoading}>
                {locationLoading ? 'Creating...' : 'Create Location'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Location Dialog */}
      <Dialog open={isEditLocationDialogOpen} onOpenChange={setIsEditLocationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
            <DialogDescription>
              Update location details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditLocation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-location-name">Location Name *</Label>
              <Input
                id="edit-location-name"
                type="text"
                placeholder="Main Office"
                value={locationFormData.name}
                onChange={(e) => setLocationFormData({ ...locationFormData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location-address">Address</Label>
              <Input
                id="edit-location-address"
                type="text"
                placeholder="123 Main St, Suite 100, City, State ZIP"
                value={locationFormData.address}
                onChange={(e) => setLocationFormData({ ...locationFormData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location-phone">Phone</Label>
              <Input
                id="edit-location-phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={locationFormData.phone}
                onChange={(e) => setLocationFormData({ ...locationFormData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location-fax">Fax</Label>
              <Input
                id="edit-location-fax"
                type="tel"
                placeholder="(555) 123-4568"
                value={locationFormData.fax}
                onChange={(e) => setLocationFormData({ ...locationFormData, fax: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location-timezone">Timezone *</Label>
              <Select
                value={locationFormData.timezone}
                onValueChange={(value) => setLocationFormData({ ...locationFormData, timezone: value })}
              >
                <SelectTrigger id="edit-location-timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern (America/New_York)</SelectItem>
                  <SelectItem value="America/Chicago">Central (America/Chicago)</SelectItem>
                  <SelectItem value="America/Denver">Mountain (America/Denver)</SelectItem>
                  <SelectItem value="America/Phoenix">Arizona (America/Phoenix)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific (America/Los_Angeles)</SelectItem>
                  <SelectItem value="America/Anchorage">Alaska (America/Anchorage)</SelectItem>
                  <SelectItem value="Pacific/Honolulu">Hawaii (Pacific/Honolulu)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {locationError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {locationError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditLocationDialogOpen(false)}
                disabled={locationLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={locationLoading}>
                {locationLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Location Confirmation Dialog */}
      <Dialog open={isDeleteLocationDialogOpen} onOpenChange={setIsDeleteLocationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Location</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedLocation?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {locationError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {locationError}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteLocationDialogOpen(false)}
              disabled={locationLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteLocation}
              disabled={locationLoading}
            >
              {locationLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Invitation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invitation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the invitation for {invitationToDelete?.email}? This will also remove their auth account if they haven't completed signup yet. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {userError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {userError}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setInvitationToDelete(null)
              }}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteInvitation}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Roles Dialog */}
      <Dialog open={isEditRolesDialogOpen} onOpenChange={setIsEditRolesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Roles</DialogTitle>
            <DialogDescription>
              Update roles for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Select Roles (must select at least one)</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="role-admin"
                    checked={editingRoles.includes('admin')}
                    onCheckedChange={() => toggleRole('admin')}
                  />
                  <label
                    htmlFor="role-admin"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Admin - Full access to all settings
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="role-provider"
                    checked={editingRoles.includes('provider')}
                    onCheckedChange={() => toggleRole('provider')}
                  />
                  <label
                    htmlFor="role-provider"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Provider - Can see patients and generate notes
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="role-staff"
                    checked={editingRoles.includes('staff')}
                    onCheckedChange={() => toggleRole('staff')}
                  />
                  <label
                    htmlFor="role-staff"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Staff - Can view everything, modify own profile
                  </label>
                </div>
              </div>
            </div>
            {roleError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {roleError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditRolesDialogOpen(false)}
                disabled={roleLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateRoles}
                disabled={roleLoading || editingRoles.length === 0}
              >
                {roleLoading ? 'Saving...' : 'Save Roles'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deactivate/Reactivate User Dialog */}
      <Dialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {userToDeactivate?.is_active ? 'Deactivate User' : 'Reactivate User'}
            </DialogTitle>
            <DialogDescription>
              {userToDeactivate?.is_active
                ? `Are you sure you want to deactivate ${userToDeactivate.email}?`
                : `Are you sure you want to reactivate ${userToDeactivate?.email}?`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {userToDeactivate?.is_active ? (
              <div className="rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  What happens when you deactivate this user:
                </p>
                <ul className="text-sm text-amber-800 dark:text-amber-200 mt-2 space-y-1 list-disc list-inside">
                  <li>They will not be able to log in</li>
                  <li>They won't appear in provider lists</li>
                  <li>Their existing data will be preserved</li>
                  <li>You can reactivate them at any time</li>
                </ul>
              </div>
            ) : (
              <div className="rounded-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  What happens when you reactivate this user:
                </p>
                <ul className="text-sm text-green-800 dark:text-green-200 mt-2 space-y-1 list-disc list-inside">
                  <li>They will be able to log in again</li>
                  <li>They'll appear in provider lists</li>
                  <li>All their data will be accessible</li>
                </ul>
              </div>
            )}
          </div>

          {userError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {userError}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeactivateDialogOpen(false)
                setUserToDeactivate(null)
              }}
              disabled={deactivateLoading}
            >
              Cancel
            </Button>
            <Button
              variant={userToDeactivate?.is_active ? "destructive" : "default"}
              onClick={handleDeactivateUser}
              disabled={deactivateLoading}
            >
              {deactivateLoading
                ? (userToDeactivate?.is_active ? 'Deactivating...' : 'Reactivating...')
                : (userToDeactivate?.is_active ? 'Deactivate User' : 'Reactivate User')
              }
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Visit Type Dialog */}
      <Dialog open={isCreateVisitTypeDialogOpen} onOpenChange={setIsCreateVisitTypeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Visit Type</DialogTitle>
            <DialogDescription>
              Create a new visit type for appointments
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateVisitType} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-visit-type-name">Visit Type Name *</Label>
              <Input
                id="create-visit-type-name"
                type="text"
                placeholder="Annual Physical, Sick Visit, etc."
                value={visitTypeFormData.name}
                onChange={(e) => setVisitTypeFormData({ ...visitTypeFormData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-visit-type-duration">Duration (minutes) *</Label>
              <Input
                id="create-visit-type-duration"
                type="number"
                min="5"
                max="240"
                value={visitTypeFormData.duration_minutes}
                onChange={(e) => setVisitTypeFormData({ ...visitTypeFormData, duration_minutes: e.target.value })}
                required
              />
            </div>
            {visitTypeError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {visitTypeError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateVisitTypeDialogOpen(false)}
                disabled={visitTypeLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={visitTypeLoading}>
                {visitTypeLoading ? 'Creating...' : 'Create Visit Type'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Visit Type Dialog */}
      <Dialog open={isEditVisitTypeDialogOpen} onOpenChange={setIsEditVisitTypeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Visit Type</DialogTitle>
            <DialogDescription>
              Update visit type details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditVisitType} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-visit-type-name">Visit Type Name *</Label>
              <Input
                id="edit-visit-type-name"
                type="text"
                placeholder="Annual Physical, Sick Visit, etc."
                value={visitTypeFormData.name}
                onChange={(e) => setVisitTypeFormData({ ...visitTypeFormData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-visit-type-duration">Duration (minutes) *</Label>
              <Input
                id="edit-visit-type-duration"
                type="number"
                min="5"
                max="240"
                value={visitTypeFormData.duration_minutes}
                onChange={(e) => setVisitTypeFormData({ ...visitTypeFormData, duration_minutes: e.target.value })}
                required
              />
            </div>
            {visitTypeError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {visitTypeError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditVisitTypeDialogOpen(false)}
                disabled={visitTypeLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={visitTypeLoading}>
                {visitTypeLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Visit Type Confirmation Dialog */}
      <Dialog open={isDeleteVisitTypeDialogOpen} onOpenChange={setIsDeleteVisitTypeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Visit Type</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedVisitType?.name}&quot;?
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            <p className="font-medium">Warning:</p>
            <p className="mt-1">
              This will hide the visit type from all users. Existing appointments with this visit type will not be affected.
            </p>
          </div>
          {visitTypeError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {visitTypeError}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteVisitTypeDialogOpen(false)}
              disabled={visitTypeLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteVisitType}
              disabled={visitTypeLoading}
            >
              {visitTypeLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Vital Definition Dialog */}
      <Dialog open={isCreateVitalDialogOpen} onOpenChange={setIsCreateVitalDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Vital Sign</DialogTitle>
            <DialogDescription>
              Create a new vital sign with custom metrics. Example: Blood Pressure with Systolic and Diastolic metrics.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateVital} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-vital-name">Vital Sign Name *</Label>
              <Input
                id="create-vital-name"
                type="text"
                placeholder="e.g., Weight, BMI, Oxygen Saturation, Blood Pressure"
                value={vitalFormData.name}
                onChange={(e) => setVitalFormData({ ...vitalFormData, name: e.target.value })}
                required
              />
            </div>

            {/* Metrics Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Metrics *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setVitalFormData({
                      ...vitalFormData,
                      metrics: [...vitalFormData.metrics, { label: '', key: '', unit: '' }]
                    })
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Metric
                </Button>
              </div>
              {vitalFormData.metrics.map((metric, idx) => (
                <div key={idx} className="flex gap-2 items-end border p-3 rounded-md">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Label</Label>
                    <Input
                      placeholder="e.g., Systolic"
                      value={metric.label}
                      onChange={(e) => {
                        const newMetrics = [...vitalFormData.metrics]
                        if (newMetrics[idx]) {
                          newMetrics[idx].label = e.target.value
                        }
                        setVitalFormData({ ...vitalFormData, metrics: newMetrics })
                      }}
                      required
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Key</Label>
                    <Input
                      placeholder="e.g., sbp"
                      value={metric.key}
                      onChange={(e) => {
                        const newMetrics = [...vitalFormData.metrics]
                        if (newMetrics[idx]) {
                          newMetrics[idx].key = e.target.value
                        }
                        setVitalFormData({ ...vitalFormData, metrics: newMetrics })
                      }}
                      required
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Unit</Label>
                    <Input
                      placeholder="e.g., mmHg"
                      value={metric.unit || ''}
                      onChange={(e) => {
                        const newMetrics = [...vitalFormData.metrics]
                        if (newMetrics[idx]) {
                          newMetrics[idx].unit = e.target.value
                        }
                        setVitalFormData({ ...vitalFormData, metrics: newMetrics })
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newMetrics = vitalFormData.metrics.filter((_, i) => i !== idx)
                      setVitalFormData({ ...vitalFormData, metrics: newMetrics })
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {vitalFormData.metrics.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Add at least one metric. Use "key" in display format (e.g., if key is "sbp", use {'{sbp}'} in format).
                </p>
              )}
            </div>

            {/* Display Format */}
            <div className="space-y-2">
              <Label htmlFor="create-vital-format">Display Format *</Label>
              <Input
                id="create-vital-format"
                type="text"
                placeholder="e.g., {sbp}/{dbp} or {lbs} or {feet}'{inches}&quot;"
                value={vitalFormData.display_format}
                onChange={(e) => setVitalFormData({ ...vitalFormData, display_format: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                Use {'{key}'} placeholders from your metrics. Example: {'{sbp}/{dbp}'} for "120/80"
              </p>
            </div>

            {vitalError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {vitalError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateVitalDialogOpen(false)}
                disabled={vitalLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={vitalLoading}>
                {vitalLoading ? 'Creating...' : 'Create Vital Sign'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Vital Definition Dialog */}
      <Dialog open={isEditVitalDialogOpen} onOpenChange={setIsEditVitalDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Vital Sign</DialogTitle>
            <DialogDescription>
              Update vital sign metrics and display format
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditVital} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-vital-name">Vital Sign Name *</Label>
              <Input
                id="edit-vital-name"
                type="text"
                placeholder="e.g., Weight, BMI, Oxygen Saturation, Blood Pressure"
                value={vitalFormData.name}
                onChange={(e) => setVitalFormData({ ...vitalFormData, name: e.target.value })}
                required
              />
            </div>

            {/* Metrics Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Metrics *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setVitalFormData({
                      ...vitalFormData,
                      metrics: [...vitalFormData.metrics, { label: '', key: '', unit: '' }]
                    })
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Metric
                </Button>
              </div>
              {vitalFormData.metrics.map((metric, idx) => (
                <div key={idx} className="flex gap-2 items-end border p-3 rounded-md">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Label</Label>
                    <Input
                      placeholder="e.g., Systolic"
                      value={metric.label}
                      onChange={(e) => {
                        const newMetrics = [...vitalFormData.metrics]
                        if (newMetrics[idx]) {
                          newMetrics[idx].label = e.target.value
                        }
                        setVitalFormData({ ...vitalFormData, metrics: newMetrics })
                      }}
                      required
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Key</Label>
                    <Input
                      placeholder="e.g., sbp"
                      value={metric.key}
                      onChange={(e) => {
                        const newMetrics = [...vitalFormData.metrics]
                        if (newMetrics[idx]) {
                          newMetrics[idx].key = e.target.value
                        }
                        setVitalFormData({ ...vitalFormData, metrics: newMetrics })
                      }}
                      required
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Unit</Label>
                    <Input
                      placeholder="e.g., mmHg"
                      value={metric.unit || ''}
                      onChange={(e) => {
                        const newMetrics = [...vitalFormData.metrics]
                        if (newMetrics[idx]) {
                          newMetrics[idx].unit = e.target.value
                        }
                        setVitalFormData({ ...vitalFormData, metrics: newMetrics })
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newMetrics = vitalFormData.metrics.filter((_, i) => i !== idx)
                      setVitalFormData({ ...vitalFormData, metrics: newMetrics })
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {vitalFormData.metrics.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Add at least one metric. Use "key" in display format (e.g., if key is "sbp", use {'{sbp}'} in format).
                </p>
              )}
            </div>

            {/* Display Format */}
            <div className="space-y-2">
              <Label htmlFor="edit-vital-format">Display Format *</Label>
              <Input
                id="edit-vital-format"
                type="text"
                placeholder="e.g., {sbp}/{dbp} or {lbs} or {feet}'{inches}&quot;"
                value={vitalFormData.display_format}
                onChange={(e) => setVitalFormData({ ...vitalFormData, display_format: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                Use {'{key}'} placeholders from your metrics. Example: {'{sbp}/{dbp}'} for "120/80"
              </p>
            </div>

            {vitalError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {vitalError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditVitalDialogOpen(false)}
                disabled={vitalLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={vitalLoading}>
                {vitalLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Vital Definition Confirmation Dialog */}
      <Dialog open={isDeleteVitalDialogOpen} onOpenChange={setIsDeleteVitalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Vital Sign</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedVital?.name}&quot;?
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            <p className="font-medium">Warning:</p>
            <p className="mt-1">
              This will hide the vital sign from all users. Existing vital records will not be affected.
            </p>
          </div>
          {vitalError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {vitalError}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteVitalDialogOpen(false)}
              disabled={vitalLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteVital}
              disabled={vitalLoading}
            >
              {vitalLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Referral Status Dialog */}
      <Dialog open={isCreateStatusDialogOpen} onOpenChange={setIsCreateStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Referral Status</DialogTitle>
            <DialogDescription>
              Create a new status for your referral pipeline
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateStatus}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="status-name">Status Name *</Label>
                <Input
                  id="status-name"
                  placeholder="e.g., Contacted, Scheduled"
                  value={statusFormData.name}
                  onChange={(e) => setStatusFormData({ ...statusFormData, name: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Use &quot;Change Order&quot; button to reorder statuses after creation
                </p>
              </div>
              {statusError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {statusError}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateStatusDialogOpen(false)}
                disabled={statusLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={statusLoading}>
                {statusLoading ? 'Creating...' : 'Create Status'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Referral Status Dialog */}
      <Dialog open={isEditStatusDialogOpen} onOpenChange={setIsEditStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Referral Status</DialogTitle>
            <DialogDescription>
              Update the referral status details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateStatus}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status-name">Status Name *</Label>
                <Input
                  id="edit-status-name"
                  placeholder="e.g., Contacted, Scheduled"
                  value={statusFormData.name}
                  onChange={(e) => setStatusFormData({ ...statusFormData, name: e.target.value })}
                  required
                />
              </div>
              {statusError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {statusError}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditStatusDialogOpen(false)}
                disabled={statusLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={statusLoading}>
                {statusLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Referral Status Dialog */}
      <Dialog open={isDeleteStatusDialogOpen} onOpenChange={setIsDeleteStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Referral Status</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedStatus?.name}&quot;?
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            <p>
              This action cannot be undone. Referrals using this status may be affected.
            </p>
          </div>
          {statusError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {statusError}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteStatusDialogOpen(false)}
              disabled={statusLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteStatus}
              disabled={statusLoading}
            >
              {statusLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Referral Source Dialog */}
      <Dialog open={isCreateSourceDialogOpen} onOpenChange={setIsCreateSourceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Referral Source</DialogTitle>
            <DialogDescription>
              Create a new source for tracking where referrals come from
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSource}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="source-name">Source Name *</Label>
                <Input
                  id="source-name"
                  placeholder="e.g., Website, Social Media, Partner Clinic"
                  value={sourceFormData.name}
                  onChange={(e) => setSourceFormData({ ...sourceFormData, name: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Sources are displayed alphabetically
                </p>
              </div>
              {sourceError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {sourceError}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateSourceDialogOpen(false)}
                disabled={sourceLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={sourceLoading}>
                {sourceLoading ? 'Creating...' : 'Create Source'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Referral Source Dialog */}
      <Dialog open={isEditSourceDialogOpen} onOpenChange={setIsEditSourceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Referral Source</DialogTitle>
            <DialogDescription>
              Update the referral source details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSource}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-source-name">Source Name *</Label>
                <Input
                  id="edit-source-name"
                  placeholder="e.g., Website, Social Media, Partner Clinic"
                  value={sourceFormData.name}
                  onChange={(e) => setSourceFormData({ ...sourceFormData, name: e.target.value })}
                  required
                />
              </div>
              {sourceError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {sourceError}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditSourceDialogOpen(false)}
                disabled={sourceLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={sourceLoading}>
                {sourceLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Referral Source Dialog */}
      <Dialog open={isDeleteSourceDialogOpen} onOpenChange={setIsDeleteSourceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Referral Source</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedSource?.name}&quot;?
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            <p>
              This action cannot be undone. Referrals using this source may be affected.
            </p>
          </div>
          {sourceError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {sourceError}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteSourceDialogOpen(false)}
              disabled={sourceLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSource}
              disabled={sourceLoading}
            >
              {sourceLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}

export default function OrganizationSettingsPage() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AppLayout>
    }>
      <OrganizationSettingsContent />
    </Suspense>
  )
}
