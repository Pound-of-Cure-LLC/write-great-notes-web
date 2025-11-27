'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api-client'
import { AppLayout } from '@/components/AppLayout'
import { FileText, Loader2, CheckCircle2, AlertCircle, Trash2, GripVertical } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { MarkdownTiptapEditor } from '@/components/MarkdownTiptapEditor'
import { ChangeHistorySection } from '@/components/settings/ChangeHistorySection'
import { createClient } from '@/lib/supabase/client'
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
type VisitType = {
  id: string
  name: string
  duration_minutes: number
  section_count: number
}

type NoteSection = {
  id: string
  visit_type_id: string
  section_name: string
  section_type_slug: string
  section_type_display_name?: string
  note_section_type_id?: string
  brief_summary: string | null
  section_order: number
}

type NoteSectionType = {
  id: string
  section_type_slug: string
  display_name: string
  description: string | null
  default_order: number
  is_active: boolean
}

type ImportedSection = {
  section_name: string
  section_type_slug: string
  brief_summary: string
  ai_instructions: string
  ai_example: string
  section_order: number
}

// Sortable item component for drag-and-drop
function SortableSection({
  section,
  isReordering,
  noteSectionTypes,
  onUpdateType,
  onDelete,
}: {
  section: NoteSection
  isReordering: boolean
  noteSectionTypes: NoteSectionType[]
  onUpdateType: (sectionId: string, newTypeId: string) => void
  onDelete: (section: NoteSection) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-md border p-3 flex items-start justify-between group"
    >
      {/* Drag handle - only visible in reordering mode */}
      {isReordering && (
        <div
          {...attributes}
          {...listeners}
          className="mr-2 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
      )}

      <div className="flex-1">
        <div className="font-medium flex items-center gap-2">
          <span>{section.section_name}</span>
          {!isReordering && section.section_type_display_name && section.note_section_type_id && (
            <Select
              value={section.note_section_type_id}
              onValueChange={(value) => {
                logger.info('[NoteSections] Select onValueChange called', { 
                  sectionId: section.id, 
                  oldValue: section.note_section_type_id, 
                  newValue: value 
                })
                onUpdateType(section.id, value)
              }}
            >
              <SelectTrigger className="w-auto h-7 text-sm font-normal border-muted bg-transparent">
                <SelectValue>
                  {section.section_type_display_name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {noteSectionTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {isReordering && section.section_type_display_name && (
            <span className="text-sm text-muted-foreground px-2 py-1 bg-muted rounded">
              {section.section_type_display_name}
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {section.brief_summary || 'No summary available'}
        </div>
      </div>

      {!isReordering && (
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onDelete(section)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      )}
    </div>
  )
}

function NoteSectionsSettingsPageContent() {
  const searchParams = useSearchParams()
  const visitTypeFromUrl = searchParams.get('visit_type')

  const [userId, setUserId] = useState<string | null>(null)
  const [visitTypes, setVisitTypes] = useState<VisitType[]>([])
  const [selectedTab, setSelectedTab] = useState(visitTypeFromUrl || 'overview')
  const [noteSections, setNoteSections] = useState<NoteSection[]>([])
  const [noteSectionTypes, setNoteSectionTypes] = useState<NoteSectionType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)

  // Customized note instructions state
  const [userNoteInstructions, setUserNoteInstructions] = useState("")
  const [savingInstructions, setSavingInstructions] = useState(false)

  // Modification state (tab-specific)
  const [modificationPrompts, setModificationPrompts] = useState<Record<string, string>>({})
  const [modifying, setModifying] = useState<Record<string, boolean>>({})
  const [processingJobId, setProcessingJobId] = useState<string | null>(null)
  const [processingJobVisitTypeId, setProcessingJobVisitTypeId] = useState<string | null>(null)
  const [completedJobs, setCompletedJobs] = useState<Set<string>>(new Set())

  // Import state
  const [showImportModal, setShowImportModal] = useState(false)
  const [importNoteText, setImportNoteText] = useState('')
  const [importing, setImporting] = useState<Record<string, boolean>>({})
  const [importError, setImportError] = useState('')
  const [importedSections, setImportedSections] = useState<ImportedSection[]>([])
  const [selectedSections, setSelectedSections] = useState<Set<number>>(new Set())
  const [importFormat, setImportFormat] = useState<'bulleted' | 'narrative'>('bulleted')
  const [importJobType, setImportJobType] = useState<'create' | 'update' | null>(null)
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)

  // Reset state
  const [resettingVisitType, setResettingVisitType] = useState<VisitType | null>(null)

  // Delete state
  const [deletingSection, setDeletingSection] = useState<NoteSection | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Drag-and-drop ordering state
  const [isReordering, setIsReordering] = useState(false)
  const [localSections, setLocalSections] = useState<NoteSection[]>([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSavingOrder, setIsSavingOrder] = useState(false)

  // Scroll position preservation
  const scrollPositionRef = useRef<number>(0)

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        // Fetch user profile to get note instructions
        try {
          const profile = await apiGet<{ user_note_instructions: string | null }>('/users/me')
          setUserNoteInstructions(profile.user_note_instructions || "")
        } catch (err) {
          logger.error('Failed to fetch user profile:', err)
        }
      }
    }
    fetchUser()
    fetchOverview()
    fetchNoteSectionTypes()
  }, [])

  useEffect(() => {
    if (selectedTab !== 'overview') {
      fetchNoteSections(selectedTab)
      // Only check for pending jobs if userId is available
      if (userId) {
        checkForPendingJobs(selectedTab)
      }
    } else {
      // Clear sections when switching to overview tab
      setNoteSections([])
      setProcessingJobId(null)
      setProcessingJobVisitTypeId(null)
    }
  }, [selectedTab, userId])

  // Subscribe to job status updates
  useEffect(() => {
    if (!processingJobId || !userId) return

    logger.info(`[JobMonitor] Setting up subscription for job: ${processingJobId}`)

    const supabase = createClient()
    const channel = supabase
      .channel(`job:${processingJobId}`)
      .on('postgres_changes', {
        event: '*',  // Listen to ALL events for debugging
        schema: 'public',
        table: 'jobs',
        filter: `id=eq.${processingJobId}`
      }, (payload: any) => {
        const jobId = processingJobId // Capture job ID for closure

        logger.info(`[JobMonitor] ✅ RECEIVED ${payload.eventType} EVENT for job ${jobId}!`, {
          eventType: payload.eventType,
          status: payload.new?.status,
          oldStatus: payload.old?.status,
          fullPayload: payload
        })

        if (payload.eventType === 'UPDATE' && payload.new.status === 'completed') {
          logger.info(`[JobMonitor] Job ${jobId} completed successfully`)

          // Mark job as completed
          setCompletedJobs(prev => {
            const next = new Set([...prev, jobId])
            logger.info(`[JobMonitor] Updated completedJobs Set:`, Array.from(next))
            return next
          })

          // Clear importing state
          setImporting(prev => ({ ...prev, [selectedTab]: false }))
          setImportJobType(null)

          // Refresh data immediately
          fetchNoteSections(selectedTab)
          fetchOverview()

          // Clear after showing "Completed" for 2 seconds
          setTimeout(() => {
            logger.info(`[JobMonitor] Clearing job ${jobId} from UI after 2s delay`)
            setProcessingJobId(null)
            setCompletedJobs(prev => {
              const next = new Set(prev)
              next.delete(jobId)
              return next
            })
          }, 2000)
        } else if (payload.eventType === 'UPDATE' && payload.new.status === 'failed') {
          logger.error(`[JobMonitor] Job ${jobId} failed:`, payload.new.last_error)
          setProcessingJobId(null)
          setImporting(prev => ({ ...prev, [selectedTab]: false }))
          setImportJobType(null)
          setError(payload.new.last_error || 'Job failed')
          setTimeout(() => setError(''), 5000)
        }
      })
      .subscribe((status) => {
        logger.info(`[JobMonitor] Subscription status for job ${processingJobId}:`, status)
        if (status === 'SUBSCRIBED') {
          logger.info(`[JobMonitor] ✅ Successfully subscribed! Waiting for UPDATE events on jobs table for id=${processingJobId}`)
        } else if (status === 'CHANNEL_ERROR') {
          logger.error(`[JobMonitor] ❌ Channel error! Realtime may not be enabled for jobs table`)
        } else if (status === 'TIMED_OUT') {
          logger.error(`[JobMonitor] ❌ Subscription timed out`)
        }
      })

    return () => {
      logger.info(`[JobMonitor] Unsubscribing from job: ${processingJobId}`)
      channel.unsubscribe()
    }
  }, [processingJobId, userId, selectedTab])

  const fetchOverview = async () => {
    try {
      const data = await apiGet<{ visit_types: VisitType[] }>('/note-sections/overview')
      setVisitTypes(data.visit_types)

      // Auto-select first visit type if available
      if (data.visit_types.length > 0 && selectedTab === 'overview' && data.visit_types[0]) {
        // Don't auto-switch, stay on overview
      }
    } catch (err) {
      logger.error('Failed to fetch overview', err)
    }
  }

  const fetchNoteSections = async (visitTypeId: string) => {
    try {
      // Clear sections immediately to show loading state and prevent stale data
      setNoteSections([])
      const data = await apiGet<NoteSection[]>(`/note-sections?visit_type_id=${visitTypeId}`)
      setNoteSections(data)
    } catch (err) {
      logger.error('Failed to fetch note sections', err)
      setNoteSections([]) // Clear sections on error too
    }
  }

  const fetchNoteSectionTypes = async () => {
    try {
      const data = await apiGet<NoteSectionType[]>('/note-sections/types')
      setNoteSectionTypes(data)
    } catch (err) {
      logger.error('Failed to fetch note section types', err)
    }
  }

  const checkForPendingJobs = async (visitTypeId: string) => {
    if (!userId) return

    try {
      // Check for all three job types: import_create, template_modification, and legacy import
      const [importCreateJobs, templateJobs, legacyImportJobs] = await Promise.all([
        apiGet<{ jobs: Array<{ id: string; status: string; job_type: string }>; count: number }>(
          `/jobs/my-pending?job_type=note_section_import_create&visit_type_id=${visitTypeId}`
        ),
        apiGet<{ jobs: Array<{ id: string; status: string; job_type: string }>; count: number }>(
          `/jobs/my-pending?job_type=template_modification&visit_type_id=${visitTypeId}`
        ),
        apiGet<{ jobs: Array<{ id: string; status: string; job_type: string }>; count: number }>(
          `/jobs/my-pending?job_type=note_section_import&visit_type_id=${visitTypeId}`
        )
      ])

      // Prioritize: import_create > template_modification > legacy import
      const pendingJob = importCreateJobs.jobs?.[0] || templateJobs.jobs?.[0] || legacyImportJobs.jobs?.[0]

      if (pendingJob) {
        logger.info(`[JobMonitor] Found pending/processing job on page load:`, pendingJob.id, pendingJob.job_type)
        setProcessingJobId(pendingJob.id)
        setProcessingJobVisitTypeId(visitTypeId)

        // Set importing state and job type if it's an import_create job
        if (importCreateJobs.jobs?.[0]) {
          setImporting(prev => ({ ...prev, [visitTypeId]: true }))
          setImportJobType('create')
        } else if (legacyImportJobs.jobs?.[0]) {
          setImporting(prev => ({ ...prev, [visitTypeId]: true }))
          setImportJobType('create') // Legacy imports treated as create
        } else if (templateJobs.jobs?.[0]) {
          // Set modifying state for template_modification jobs so button shows loading state
          setModifying(prev => ({ ...prev, [visitTypeId]: true }))
        }
      } else {
        // No job found for this visit type - clear state if current job belongs to this tab
        if (processingJobVisitTypeId === visitTypeId) {
          logger.info(`[JobMonitor] No pending jobs for visit type ${visitTypeId}, clearing job state`)
          setProcessingJobId(null)
          setProcessingJobVisitTypeId(null)
        }
      }
    } catch (err) {
      logger.error('Failed to check for pending jobs:', err)
      // Don't fail silently - this is OK, just means no pending jobs or API error
    }
  }

  const handleUpdateSectionType = async (sectionId: string, newTypeId: string) => {
    logger.info('[NoteSections] handleUpdateSectionType called', { sectionId, newTypeId })
    try {
      logger.info('[NoteSections] Making API call to update section type', { 
        sectionId, 
        newTypeId,
        endpoint: `/note-sections/${sectionId}/type`
      })
      const updatedSection = await apiPatch<NoteSection>(`/note-sections/${sectionId}/type`, {
        note_section_type_id: newTypeId
      })
      logger.info('[NoteSections] API call successful', { updatedSection })

      // Reload all sections to get proper ordering after type change
      await fetchNoteSections(selectedTab)

      setEditingSectionId(null)
      setSuccess('Section type updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      logger.error('[NoteSections] Failed to update section type', { 
        sectionId, 
        newTypeId, 
        error: err 
      })
      setError(err.message || 'Failed to update section type')
      setTimeout(() => setError(''), 5000)
    }
  }

  // Drag-and-drop handlers
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleToggleReordering = () => {
    if (isReordering) {
      // Cancel reordering - discard changes
      setIsReordering(false)
      setLocalSections([])
      setHasUnsavedChanges(false)
    } else {
      // Start reordering - copy current sections to local state
      setIsReordering(true)
      setLocalSections([...noteSections])
      setHasUnsavedChanges(false)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    setLocalSections((sections) => {
      const oldIndex = sections.findIndex((s) => s.id === active.id)
      const newIndex = sections.findIndex((s) => s.id === over.id)

      // Validate indices
      if (oldIndex === -1 || newIndex === -1) {
        return sections
      }

      // Check if dragging across type boundaries
      const oldSection = sections[oldIndex]
      const newSection = sections[newIndex]

      if (!oldSection || !newSection) {
        return sections
      }

      if (oldSection.note_section_type_id !== newSection.note_section_type_id) {
        // Don't allow dragging across type boundaries
        setError('Cannot reorder sections across different types')
        setTimeout(() => setError(''), 3000)
        return sections
      }

      setHasUnsavedChanges(true)
      return arrayMove(sections, oldIndex, newIndex)
    })
  }

  const handleSaveOrder = async () => {
    setIsSavingOrder(true)
    try {
      // Group sections by type and calculate new order within each type
      const sectionsByType = new Map<string, NoteSection[]>()

      localSections.forEach((section) => {
        const typeId = section.note_section_type_id || 'unknown'
        if (!sectionsByType.has(typeId)) {
          sectionsByType.set(typeId, [])
        }
        sectionsByType.get(typeId)!.push(section)
      })

      // Build update payload with new order numbers
      const updates: Array<{section_id: string; new_order: number; note_section_type_id: string}> = []
      for (const [typeId, sections] of sectionsByType.entries()) {
        sections.forEach((section, index) => {
          updates.push({
            section_id: section.id,
            new_order: index + 1,
            note_section_type_id: typeId
          })
        })
      }

      // Send batch update to backend
      await apiPatch('/note-sections/reorder-batch', { updates })

      // Reload sections from backend to get canonical ordering
      await fetchNoteSections(selectedTab)

      setIsReordering(false)
      setLocalSections([])
      setHasUnsavedChanges(false)
      setSuccess('Section order updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save section order')
      setTimeout(() => setError(''), 5000)
    } finally {
      setIsSavingOrder(false)
    }
  }

  const handleModifyWithPrompt = async () => {
    const currentPrompt = modificationPrompts[selectedTab] || ''
    if (!currentPrompt.trim()) {
      setError('Please enter a modification prompt')
      setTimeout(() => setError(''), 3000)
      return
    }

    setModifying(prev => ({ ...prev, [selectedTab]: true }))
    setError('')

    try {
      // Backend returns 202 Accepted with job_id
      const response = await apiPost<{ status: string; message: string; job_id: string }>('/note-sections/modify-with-prompt', {
        visit_type_id: selectedTab,
        user_prompt: currentPrompt
      })

      // Clear the prompt for this specific tab
      setModificationPrompts(prev => ({ ...prev, [selectedTab]: '' }))

      // Set processing job ID to trigger realtime monitoring
      setProcessingJobId(response.job_id)
      setProcessingJobVisitTypeId(selectedTab)
    } catch (err: any) {
      setError(err.message || 'Failed to submit modification request')
      setTimeout(() => setError(''), 5000)
    } finally {
      setModifying(prev => ({ ...prev, [selectedTab]: false }))
    }
  }

  const handleImportFromNote = async () => {
    if (!importNoteText.trim()) {
      setImportError('Please paste a note to import')
      return
    }

    // Infer job type based on whether sections exist
    const jobType = noteSections.length === 0 ? 'create' : 'update'
    setImportJobType(jobType)
    setImporting(prev => ({ ...prev, [selectedTab]: true }))
    setImportError('')

    try {
      // Close modal immediately and show processing state
      setShowImportModal(false)

      // Backend returns 202 Accepted with job_id
      const response = await apiPost<{ status: string; message: string; job_id: string }>(
        '/note-sections/import-from-sample-note',
        {
          visit_type_id: selectedTab,
          sample_note: importNoteText,
          format: importFormat,
        }
      )

      // Reset modal state
      setImportNoteText('')
      setImportedSections([])
      setSelectedSections(new Set())
      setImportFormat('bulleted')

      // Set processing job ID to trigger realtime monitoring
      setProcessingJobId(response.job_id)
      setProcessingJobVisitTypeId(selectedTab)
    } catch (err: any) {
      setError(err.message || 'Failed to submit import request')
      setTimeout(() => setError(''), 5000)
      setImporting(prev => ({ ...prev, [selectedTab]: false }))
      setImportJobType(null)
    }
  }

  const handleCancelImport = async () => {
    if (!processingJobId) return

    try {
      await apiPost(`/jobs/${processingJobId}/cancel-my-job`, {})

      // Clear states
      setProcessingJobId(null)
      setImporting(prev => ({ ...prev, [selectedTab]: false }))
      setImportJobType(null)

      setSuccess('Import cancelled successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to cancel import')
      setTimeout(() => setError(''), 5000)
    }
  }

  const toggleSectionSelection = (index: number) => {
    const newSelected = new Set(selectedSections)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedSections(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedSections.size === importedSections.length) {
      setSelectedSections(new Set())
    } else {
      setSelectedSections(new Set(importedSections.map((_, idx) => idx)))
    }
  }

  const checkForDuplicates = () => {
    if ((noteSections || []).length > 0) {
      setShowDuplicateWarning(true)
    } else {
      performImport(false)
    }
  }

  const performImport = async (deleteExisting: boolean) => {
    setImporting(prev => ({ ...prev, [selectedTab]: true }))
    setImportError('')

    try {
      const sectionsToCreate = importedSections
        .map((section, i) => selectedSections.has(i) ? section : null)
        .filter((section): section is NonNullable<typeof section> => section !== null)
        .map(section => ({
          visit_type_id: selectedTab,
          section_name: section.section_name,
          section_type_slug: section.section_type_slug,
          brief_summary: section.brief_summary,
          ai_instructions: section.ai_instructions,
          ai_example: section.ai_example,
          section_order: section.section_order,
          is_required: false,
        }))

      await apiPost('/note-sections/bulk-import', {
        visit_type_id: selectedTab,
        sections: sectionsToCreate,
        delete_existing: deleteExisting,
      })

      setShowImportModal(false)
      setShowDuplicateWarning(false)
      setImportNoteText('')
      setImportedSections([])
      setSelectedSections(new Set())
      setImportFormat('bulleted')
      fetchNoteSections(selectedTab)
      fetchOverview()
      setSuccess(`Successfully imported ${selectedSections.size} note sections!`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setImportError(err.message || 'Failed to save imported sections')
    } finally {
      setImporting(prev => ({ ...prev, [selectedTab]: false }))
    }
  }

  const handleDeleteSection = async () => {
    if (!deletingSection) return

    // Save current scroll position before delete
    scrollPositionRef.current = window.scrollY

    setLoading(true)
    try {
      await apiDelete(`/note-sections/${deletingSection.id}`)
      setShowDeleteConfirm(false)
      setDeletingSection(null)

      // Refresh data
      await fetchNoteSections(selectedTab)
      await fetchOverview()

      // Restore scroll position after DOM updates
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPositionRef.current)
      })

      setSuccess('Section deleted successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to delete section')
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleResetVisitType = async () => {
    if (!resettingVisitType) return

    setLoading(true)
    try {
      await apiDelete(`/note-sections/reset-visit-type?visit_type_id=${resettingVisitType.id}`)
      setResettingVisitType(null)

      // Refresh data
      if (selectedTab === resettingVisitType.id) {
        setNoteSections([])
      }
      fetchOverview()

      setSuccess('Configuration reset successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to reset visit type')
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNoteInstructions = async () => {
    setSavingInstructions(true)
    setError('')
    setSuccess('')

    try {
      await apiPatch('/users/me', {
        user_note_instructions: userNoteInstructions,
      })
      setSuccess('Note instructions updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update note instructions')
      setTimeout(() => setError(''), 5000)
    } finally {
      setSavingInstructions(false)
    }
  }

  const selectedVisitType = visitTypes.find(vt => vt.id === selectedTab)

  return (
    <AppLayout>
      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 rounded-md bg-green-50 dark:bg-green-950 p-3 text-sm text-green-800 dark:text-green-200">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Note Sections Configuration</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure how AI generates clinical notes for each visit type
          </p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {visitTypes.map(vt => (
              <TabsTrigger key={vt.id} value={vt.id}>
                {vt.name}
                {vt.section_count > 0 && (
                  <span className="ml-2 text-xs bg-primary/20 px-1.5 py-0.5 rounded">
                    {vt.section_count}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customized Note Instructions</CardTitle>
                <CardDescription>
                  Guide the AI to generate notes that match your style. These instructions apply to all note types.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userNoteInstructions">
                    Your Instructions
                  </Label>
                  <Textarea
                    id="userNoteInstructions"
                    placeholder="This is your chance to provide the AI with instructions to make sure your note is great. Explain what the note should and shouldn't include, correct any common misspellings and provide the AI as many details as you'd like to make the note your own."
                    value={userNoteInstructions}
                    onChange={(e) => setUserNoteInstructions(e.target.value)}
                    rows={10}
                  />
                  <p className="text-sm text-muted-foreground">
                    These instructions will guide the AI when generating clinical notes for your appointments
                  </p>
                </div>

                <Button onClick={handleSaveNoteInstructions} disabled={savingInstructions}>
                  {savingInstructions ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Visit Types</CardTitle>
                <CardDescription>
                  Configure note templates for each visit type below. You have three options:
                  <br />
                  • <strong>Import a sample note</strong> - AI auto-generates instructions (2-3 min)
                  <br />
                  • <strong>Describe changes</strong> - Use plain language to modify sections
                  <br />
                  • <strong>Reset</strong> - Start fresh by deleting all configurations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {visitTypes.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">
                    No visit types available. Please contact your administrator.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {visitTypes.map(vt => (
                      <div
                        key={vt.id}
                        className="flex items-center justify-between border-b py-3 last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          {vt.section_count > 0 ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                          )}
                          <div>
                            <div className="font-medium">{vt.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {vt.section_count > 0
                                ? `${vt.section_count} sections configured`
                                : 'Not yet configured'}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTab(vt.id)}
                          >
                            {vt.section_count > 0 ? 'View' : 'Configure'}
                          </Button>
                          {vt.section_count > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setResettingVisitType(vt)}
                            >
                              Reset
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visit Type Tabs */}
          {visitTypes.map(vt => {
            const isActiveTab = selectedTab === vt.id
            const sectionsForThisTab = isActiveTab ? (noteSections || []) : []

            return (
            <TabsContent key={vt.id} value={vt.id} className="space-y-6">
              {importing[vt.id] && importJobType === 'create' ? (
                // First-time import in progress - Show full-page loading animation
                <Card>
                  <CardHeader>
                    <CardTitle>{vt.name} Note Sections</CardTitle>
                    <CardDescription>
                      Analyzing your note and generating custom instructions...
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 space-y-6">
                      <div className="flex justify-center">
                        <div className="rounded-full bg-primary/10 p-6">
                          <Loader2 className="h-12 w-12 text-primary animate-spin" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Analyzing Your Note...</h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                          Our AI is analyzing your clinical note to generate a customized note template tailored to your documentation style. This typically takes 1-3 minutes.
                        </p>
                      </div>
                      <div className="flex justify-center">
                        <Button
                          variant="outline"
                          onClick={handleCancelImport}
                          disabled={!processingJobId}
                        >
                          Cancel Import
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : sectionsForThisTab.length === 0 ? (
                // No sections configured - Show import prompt
                <Card>
                  <CardHeader>
                    <CardTitle>{vt.name} Note Sections</CardTitle>
                    <CardDescription>
                      No sections configured yet. Import one of your clinical notes to get started.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 space-y-6">
                      <div className="flex justify-center">
                        <div className="rounded-full bg-primary/10 p-6">
                          <FileText className="h-12 w-12 text-primary" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Get Started with AI-Powered Note Generation</h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                          Paste one of your existing clinical notes and our AI will automatically generate a customized note template tailored to your documentation style. This typically takes 1-3 minutes.
                        </p>
                      </div>
                      <Button
                        size="lg"
                        onClick={() => {
                          setImportNoteText('')
                          setImportError('')
                          setImportedSections([])
                          setSelectedSections(new Set())
                          setShowImportModal(true)
                        }}
                      >
                        <FileText className="h-5 w-5 mr-2" />
                        Import Your First Note
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                // Sections configured - Show modification UI
                <Card>
                  <CardHeader>
                    <CardTitle>{vt.name} Note Sections</CardTitle>
                    <CardDescription>
                      {sectionsForThisTab.length} sections configured. Use the prompt below to make changes, or import another note to refine your instructions. Adding example text is particularly helpful for improving accuracy.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* AI Modification Prompt */}
                    <div className="space-y-3">
                      <Label>Modify Your Note Sections</Label>
                      <Textarea
                        placeholder="Describe the changes to this template that you'd like to make..."
                        value={modificationPrompts[selectedTab] || ''}
                        onChange={(e) => setModificationPrompts(prev => ({ ...prev, [selectedTab]: e.target.value }))}
                        rows={4}
                      />
                      <div className="flex justify-between gap-2">
                        <div className="flex gap-2">
                          <Button
                            onClick={handleModifyWithPrompt}
                            disabled={!(modificationPrompts[selectedTab] || '').trim()}
                          >
                            {modifying[selectedTab] ? (
                              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Applying Changes...</>
                            ) : (
                              'Apply Changes'
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setImportNoteText('')
                              setImportError('')
                              setImportedSections([])
                              setSelectedSections(new Set())
                              setShowImportModal(true)
                            }}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Import Another Note
                          </Button>
                          {sectionsForThisTab.length > 0 && (
                            <>
                              {!isReordering ? (
                                <Button
                                  variant="outline"
                                  onClick={handleToggleReordering}
                                >
                                  <GripVertical className="h-4 w-4 mr-2" />
                                  Change the Order
                                </Button>
                              ) : (
                                <>
                                  <Button
                                    variant="default"
                                    onClick={handleSaveOrder}
                                    disabled={!hasUnsavedChanges || isSavingOrder}
                                  >
                                    {isSavingOrder ? (
                                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                                    ) : (
                                      <><CheckCircle2 className="h-4 w-4 mr-2" />Save Order</>
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={handleToggleReordering}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          onClick={() => setResettingVisitType(vt)}
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Reset All Sections
                        </Button>
                      </div>

                      {/* Job Processing Status */}
                      {processingJobId && processingJobVisitTypeId === selectedTab && (() => {
                        const isCompleted = completedJobs.has(processingJobId)
                        logger.info(`[JobMonitor] Rendering status indicator - Job: ${processingJobId}, IsCompleted: ${isCompleted}, CompletedJobs:`, Array.from(completedJobs))

                        return isCompleted ? (
                          <div className="rounded-md border border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800 p-3 flex items-center gap-3">
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                            <p className="text-sm font-medium text-green-900 dark:text-green-100">
                              Updating Template Completed
                            </p>
                          </div>
                        ) : (
                          <div className="rounded-md border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 p-3 flex items-center gap-3">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                              Updating Template - You can queue up other changes while you wait
                            </p>
                          </div>
                        )
                      })()}
                    </div>

                    {/* Change History Section - Only show for actual visit types, not overview */}
                    {userId && selectedTab !== 'overview' && (
                      <ChangeHistorySection
                        visitTypeId={selectedTab}
                        providerId={userId}
                        onUndoComplete={() => {
                          fetchNoteSections(selectedTab)
                          fetchOverview()
                          setSuccess('Successfully undid last change!')
                          setTimeout(() => setSuccess(''), 3000)
                        }}
                        onError={(message) => {
                          setError(message)
                          setTimeout(() => setError(''), 5000)
                        }}
                      />
                    )}

                    {/* Section List - With Drag-and-Drop Support */}
                    <div>
                      <h3 className="font-medium mb-3">Configured Sections</h3>
                      {isReordering ? (
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext
                            items={localSections.map(s => s.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-2">
                              {localSections.map((section) => (
                                <SortableSection
                                  key={section.id}
                                  section={section}
                                  isReordering={isReordering}
                                  noteSectionTypes={noteSectionTypes}
                                  onUpdateType={handleUpdateSectionType}
                                  onDelete={(section) => {
                                    setDeletingSection(section)
                                    setShowDeleteConfirm(true)
                                  }}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      ) : (
                        <div className="space-y-2">
                          {sectionsForThisTab.map((section) => (
                            <SortableSection
                              key={section.id}
                              section={section}
                              isReordering={isReordering}
                              noteSectionTypes={noteSectionTypes}
                              onUpdateType={handleUpdateSectionType}
                              onDelete={(section) => {
                                setDeletingSection(section)
                                setShowDeleteConfirm(true)
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            )
          })}
        </Tabs>
      </div>

      {/* Import Modal */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="max-w-[1052px] max-h-[80vh] flex flex-col p-0">
          {/* Fixed Header */}
          <DialogHeader className="px-8 pt-5 pb-3 border-b shrink-0">
            <div>
              <DialogTitle>
                {importedSections.length === 0
                  ? <>Import From Your <span className="text-primary">{selectedVisitType?.name}</span> Note</>
                  : 'Review and select the sections you want to import'}
              </DialogTitle>
              <DialogDescription>
                {importedSections.length === 0
                  ? <>Paste one of your clinical notes below and our AI will automatically generate a customized note template. <strong>Don't worry if the formatting is a little off, we'll handle this for you!</strong> Analysis typically takes 1-3 minutes.</>
                  : 'Review the AI-generated note template and select which sections to import'}
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-8 pt-4 pb-2 min-h-0">
            {importing[selectedTab] && importedSections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-muted"></div>
                  <div className="absolute top-0 h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-lg font-medium">Analyzing your note...</p>
                  <p className="text-sm text-muted-foreground">Our AI is generating your customized note template</p>
                </div>
              </div>
            ) : importedSections.length === 0 ? (
              <div className="space-y-4">
                {/* Fixed Label + Radio Group */}
                <div className="flex items-center justify-between shrink-0">
                  <Label>Paste Your Note</Label>
                  <RadioGroup
                    value={importFormat}
                    onValueChange={(value) => setImportFormat(value as 'bulleted' | 'narrative')}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bulleted" id="bulleted" />
                      <Label htmlFor="bulleted" className="cursor-pointer font-normal">Bulleted List</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="narrative" id="narrative" />
                      <Label htmlFor="narrative" className="cursor-pointer font-normal">Narrative</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Scrollable Editor Area */}
                <div className="min-h-[300px]">
                  <MarkdownTiptapEditor
                    value={importNoteText}
                    onChange={setImportNoteText}
                    minHeight={300}
                    autoHeight={false}
                  />
                </div>

                {importError && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {importError}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Select All Checkbox */}
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <Checkbox
                    id="select-all"
                    checked={selectedSections.size === importedSections.length}
                    onCheckedChange={toggleSelectAll}
                  />
                  <Label htmlFor="select-all" className="cursor-pointer font-medium">
                    Select All ({selectedSections.size} of {importedSections.length} selected)
                  </Label>
                </div>

                {/* Imported Sections List with Brief Summaries */}
                <div className="space-y-3">
                  {importedSections.map((section, index) => (
                    <div key={index} className="border rounded-md p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={`section-${index}`}
                          checked={selectedSections.has(index)}
                          onCheckedChange={() => toggleSectionSelection(index)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-1">
                          <Label htmlFor={`section-${index}`} className="cursor-pointer">
                            <div className="font-semibold text-base">
                              {section.section_order}. {section.section_name}
                            </div>
                          </Label>
                          <div className="text-sm text-muted-foreground">
                            {section.brief_summary}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {importError && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {importError}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fixed Footer */}
          <DialogFooter className="px-8 py-3 border-t shrink-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowImportModal(false)
                setImportedSections([])
                setSelectedSections(new Set())
                setImportNoteText('')
                setImportFormat('bulleted')
              }}
              disabled={importing[selectedTab]}
            >
              Cancel
            </Button>
            {importedSections.length === 0 ? (
              <Button onClick={handleImportFromNote} disabled={importing[selectedTab]}>
                {importing[selectedTab]
                  ? (noteSections.length > 0 ? 'Updating Note Template...' : 'Creating Note Template...')
                  : (noteSections.length > 0 ? 'Update Note Template' : 'Create Note Template')
                }
              </Button>
            ) : (
              <Button
                onClick={checkForDuplicates}
                disabled={importing[selectedTab] || selectedSections.size === 0}
              >
                {importing[selectedTab] ? 'Importing...' : `Import ${selectedSections.size} Section${selectedSections.size !== 1 ? 's' : ''}`}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate Warning Modal */}
      <Dialog open={showDuplicateWarning} onOpenChange={setShowDuplicateWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Existing Instructions Found</DialogTitle>
            <DialogDescription>
              This visit type already has {(noteSections || []).length} note section{(noteSections || []).length !== 1 ? 's' : ''} configured.
              Importing may create duplicate sections.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md bg-amber-50 dark:bg-amber-950 p-4 text-sm">
            <p className="font-medium text-amber-900 dark:text-amber-100">What would you like to do?</p>
            <ul className="mt-2 space-y-1 text-amber-800 dark:text-amber-200">
              <li>• <strong>Delete & Replace (Recommended):</strong> Remove existing instructions and use only the imported ones</li>
              <li>• <strong>Import Anyway:</strong> Keep existing instructions and add the imported ones (may create duplicates)</li>
            </ul>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDuplicateWarning(false)}
              disabled={importing[selectedTab]}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => performImport(false)}
              disabled={importing[selectedTab]}
            >
              {importing[selectedTab] ? 'Importing...' : 'Import Anyway'}
            </Button>
            <Button
              variant="destructive"
              onClick={() => performImport(true)}
              disabled={importing[selectedTab]}
            >
              {importing[selectedTab] ? 'Replacing...' : 'Delete & Replace'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Section Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Section?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this section?
            </DialogDescription>
          </DialogHeader>
          {deletingSection && (
            <div className="rounded-md bg-muted p-4">
              <p className="font-medium">{deletingSection.section_order}. {deletingSection.section_name}</p>
              <p className="text-sm text-muted-foreground mt-1">{deletingSection.brief_summary}</p>
            </div>
          )}
          <div className="rounded-md bg-destructive/10 p-3 text-sm">
            <p className="text-destructive font-medium">This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false)
                setDeletingSection(null)
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSection} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete Section'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Modal */}
      <Dialog open={!!resettingVisitType} onOpenChange={() => setResettingVisitType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset {resettingVisitType?.name} Configuration?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-md bg-destructive/10 p-4">
              <p className="font-medium text-destructive">⚠️ Warning</p>
              <p className="mt-2 text-sm">This will permanently delete:</p>
              <ul className="mt-2 text-sm space-y-1 list-disc list-inside">
                <li>All {resettingVisitType?.section_count} note sections</li>
                <li>All AI instructions and examples</li>
                <li>All modification history</li>
              </ul>
              <p className="mt-2 text-sm font-medium">
                This action cannot be undone.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResettingVisitType(null)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleResetVisitType} disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Configuration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}

export default function NoteSectionsSettingsPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <NoteSectionsSettingsPageContent />
    </Suspense>
  )
}
