'use client'

import { Loader2 } from 'lucide-react'
import { NoteCard } from '@/components/NoteCard'

type Note = {
  id: string
  [key: string]: any
}

type PastNotesTabContentProps = {
  notes: Note[]
  loading: boolean
  onNoteClick: (note: Note) => void
}

export function PastNotesTabContent({
  notes,
  loading,
  onNoteClick,
}: PastNotesTabContentProps) {
  return (
    <div className="mb-6 max-w-4xl mx-auto px-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide mb-3 text-center">Past Notes</h2>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : notes.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8">No past notes found for this patient.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="flex justify-center">
              <NoteCard
                note={note}
                onClick={() => onNoteClick(note)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
