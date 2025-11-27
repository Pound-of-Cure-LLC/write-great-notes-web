"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";
import { formatDate, formatTime } from "@/lib/date-utils";

interface NoteCardProps {
  note: {
    id: string;
    brief_summary?: string;
    note_text?: string;  // Added for PastNoteModel compatibility
    note_text_html?: string;  // Added for PastNoteModel - HTML version for modal display
    is_signed?: boolean;  // Made optional for PastNoteModel
    signed_at?: string;
    created_at?: string;  // Made optional for PastNoteModel (may use appointment_datetime instead)
    appointment_datetime?: string;  // Added for PastNoteModel - top-level appointment datetime
    visit_type?: string | null;  // Added for PastNoteModel - visit type name
    appointment_id?: string;  // Added for PastNoteModel - top-level appointment ID
    has_local_version?: boolean;  // Added for PastNoteModel - true if note exists in local DB
    provider_name?: string | null;  // Added for PastNoteModel - provider who created the note
    emr_settings?: {
      emr_note_id?: string;
      appointment_datetime?: string;  // Added for Recent Notes optimization
    };
    transcriptions?: {
      id: string;
      appointment_id?: string;
      external_appointment_id?: string;
      appointments?: {
        id: string;
        appointment_datetime: string;
        visit_types?: {
          name: string;
        };
      };
    };
  };
  onClick?: () => void;
  className?: string;
}

/**
 * NoteCard: Reusable note card component
 *
 * Size: 600px width, auto height
 *
 * Features:
 * - Left sidebar with date/time and status badge
 * - Visit type and brief summary
 * - Click handler for navigation
 * - Status badges: Signed (jordy-blue), Pushed to EMR (uranian-blue), Completed (secondary)
 *
 * Usage:
 * <NoteCard
 *   note={noteData}
 *   onClick={() => router.push(`/appointments/${note.appointments.id}/note`)}
 * />
 */
export function NoteCard({ note, onClick, className }: NoteCardProps) {
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

  // Get appointment datetime from multiple possible sources
  // Priority: top-level (PastNoteModel) > emr_settings (Recent Notes) > transcriptions (legacy)
  const appointmentDateTime =
    note.appointment_datetime ||
    note.emr_settings?.appointment_datetime ||
    note.transcriptions?.appointments?.appointment_datetime;
  const date = appointmentDateTime ? formatDate(appointmentDateTime) : 'N/A';
  const time = appointmentDateTime ? formatTime(appointmentDateTime) : 'N/A';

  // Get visit type from multiple possible sources
  const visitTypeName =
    note.visit_type ||
    note.transcriptions?.appointments?.visit_types?.name;

  // Get summary text - use note_text if brief_summary not available
  const summaryText = note.brief_summary || (note.note_text && note.note_text !== "(No note content available)" ? note.note_text : null);

  return (
    <Card
      className={cn(
        "w-full max-w-[600px] h-auto overflow-hidden flex",
        onClick && "cursor-pointer hover:bg-muted/50 transition-colors",
        className
      )}
      onClick={onClick}
      data-testid={`note-card-${note.id}`}
    >
      {/* Left Sidebar - Date/Time (compact) */}
      <div className="bg-primary/10 px-3 py-2 flex items-center justify-center rounded-l-xl border-r border-border w-24 shrink-0">
        <div className="flex flex-col items-center gap-1">
          {/* FileText Icon */}
          <FileText className="h-4 w-4 text-primary" />
          {/* Date */}
          <p className="text-xs font-semibold text-primary text-center whitespace-nowrap">
            {date}
          </p>
          {/* Time */}
          <p className="text-xs text-muted-foreground whitespace-nowrap">
            {time}
          </p>
        </div>
      </div>

      {/* Main Content - Note Info */}
      <div className="p-3 flex-grow">
        <div className="space-y-1">
          {/* Top Row: Visit Type, Provider Name, and Status Badge */}
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
            {getStatusBadge()}
          </div>

          {/* Summary Text */}
          {summaryText && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {summaryText}
            </p>
          )}

          {!summaryText && (
            <p className="text-xs text-muted-foreground italic">
              No summary available
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
