'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Undo2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { apiPost } from '@/lib/api-client'

import { logger } from "@/lib/logger";
type ModificationHistory = {
  id: string
  provider_id: string
  visit_type_id: string
  user_prompt: string
  sections_before: any[]
  sections_after: any[]
  summary: string | null
  created_at: string
}

type ChangeHistorySectionProps = {
  visitTypeId: string
  providerId: string
  onUndoComplete: () => void
  onError?: (message: string) => void
}

export function ChangeHistorySection({
  visitTypeId,
  providerId,
  onUndoComplete,
  onError,
}: ChangeHistorySectionProps) {
  const [history, setHistory] = useState<ModificationHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [showUndoConfirm, setShowUndoConfirm] = useState(false)
  const [undoing, setUndoing] = useState(false)

  const supabase = createClient()

  // Fetch initial history
  useEffect(() => {
    fetchHistory()
  }, [visitTypeId, providerId])

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel(`modification_history:${visitTypeId}:${providerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'note_section_modification_history',
          filter: `provider_id=eq.${providerId},visit_type_id=eq.${visitTypeId}`,
        },
        (payload) => {
          // Add new history entry to the beginning (most recent first)
          setHistory((prev) => [payload.new as ModificationHistory, ...prev])
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [visitTypeId, providerId, supabase])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('note_section_modification_history')
        .select('*')
        .eq('provider_id', providerId)
        .eq('visit_type_id', visitTypeId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setHistory(data || [])
    } catch (error) {
      logger.error('Error fetching modification history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUndo = async () => {
    if (history.length === 0) return

    setUndoing(true)
    try {
      // Call backend API to undo the last change
      await apiPost(`/note-sections/undo-last-change?visit_type_id=${visitTypeId}`)

      // Most recent is now at index 0 (descending order)
      const mostRecentHistory = history[0]

      // Update local state - remove the undone history entry
      setHistory((prev) => prev.filter((h) => h.id !== mostRecentHistory?.id))
      setShowUndoConfirm(false)

      // Notify parent to refresh sections
      onUndoComplete()
    } catch (error: any) {
      logger.error('Error undoing modification:', error)
      setShowUndoConfirm(false)
      // Call error callback if provided
      if (onError) {
        onError(error.message || 'Failed to undo last change')
      }
    } finally {
      setUndoing(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Change History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (history.length === 0) {
    // Don't render anything if there's no history
    return null
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Change History</CardTitle>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUndoConfirm(true)}
              >
                <Undo2 className="h-4 w-4 mr-1" />
                Undo Last Change
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] overflow-y-auto rounded-md border bg-muted/30 p-3">
            <ul className="space-y-2 text-sm">
              {history.map((entry, index) => (
                <li key={entry.id} className="flex items-start gap-2 group">
                  <span className="text-muted-foreground shrink-0">•</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-muted-foreground">
                      {new Date(entry.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                      {' — '}
                    </span>
                    <span className="break-words">
                      {entry.summary || entry.user_prompt}
                    </span>
                  </div>
                  {index === 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setShowUndoConfirm(true)}
                    >
                      <Undo2 className="h-3 w-3" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Undo Confirmation Modal */}
      <Dialog open={showUndoConfirm} onOpenChange={setShowUndoConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Undo Recent Change?</DialogTitle>
            <DialogDescription>
              This will restore the previous configuration and delete this change from
              history.
            </DialogDescription>
          </DialogHeader>
          {history.length > 0 && history[0] && (
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm font-medium mb-2">Change to undo:</p>
              <p className="text-sm text-muted-foreground">
                {history[0]?.summary || history[0]?.user_prompt}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {history[0]?.created_at && new Date(history[0]?.created_at || '').toLocaleString()}
              </p>
            </div>
          )}
          <div className="rounded-md bg-amber-50 dark:bg-amber-950 p-3 text-sm">
            <p className="text-amber-900 dark:text-amber-100 font-medium">
              This will restore {history[0]?.sections_before.length || 0} previous sections.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUndoConfirm(false)}
              disabled={undoing}
            >
              Cancel
            </Button>
            <Button onClick={handleUndo} disabled={undoing}>
              {undoing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Undoing...
                </>
              ) : (
                <>
                  <Undo2 className="h-4 w-4 mr-2" />
                  Undo Change
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
