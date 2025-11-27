"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import type { PastNote } from "@/types/past-note";

interface PastNotesDialogProps {
  note: PastNote | null;
  isOpen: boolean;
  onClose: () => void;
  showCloseButton?: boolean;
}

/**
 * PastNotesDialog: Reusable modal for displaying full past note content
 *
 * Features:
 * - Fixed header with date and optional "Go to Note" button
 * - Renders HTML content with XSS protection via rehype-sanitize
 * - Backend converts markdown to HTML using convert_markdown_to_html()
 * - Handles multiple date sources (appointment_datetime, emr_settings, transcriptions)
 * - Empty state for notes without content
 * - Optional close button (defaults to shadcn Dialog's built-in close)
 *
 * Architecture:
 * - EMR notes (Charm): Already HTML from EMR API → stored in note_text_html
 * - Generated notes: Markdown stored in note_text → backend converts to HTML → note_text_html
 * - Frontend always receives HTML in note_text_html field (backend responsibility to convert)
 * - Uses react-markdown with rehype-raw + rehype-sanitize for XSS protection
 *
 * Usage:
 * ```tsx
 * const [selectedNote, setSelectedNote] = useState<PastNote | null>(null);
 *
 * <PastNotesDialog
 *   note={selectedNote}
 *   isOpen={!!selectedNote}
 *   onClose={() => setSelectedNote(null)}
 * />
 * ```
 */
export function PastNotesDialog({
  note,
  isOpen,
  onClose,
  showCloseButton = false,
}: PastNotesDialogProps) {
  const router = useRouter();

  /**
   * Get appointment date from multiple possible sources
   * Priority: top-level > emr_settings > transcriptions
   */
  const getAppointmentDate = (): string | null => {
    if (!note) return null;

    if (note.appointment_datetime) {
      return note.appointment_datetime;
    }

    if (note.emr_settings?.appointment_datetime) {
      return note.emr_settings.appointment_datetime;
    }

    if (note.transcriptions?.appointments?.appointment_datetime) {
      return note.transcriptions.appointments.appointment_datetime;
    }

    return null;
  };

  /**
   * Format date to readable format (e.g., "Oct 28, 2025")
   */
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return "";

    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  const appointmentDate = getAppointmentDate();
  const formattedDate = formatDate(appointmentDate);

  // Get content (backend always converts markdown to HTML before sending)
  const content = note?.note_text_html || note?.note_text || "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`max-w-4xl h-[85vh] flex flex-col p-0 gap-0 ${showCloseButton ? '[&>button]:hidden' : ''}`}
      >
        {/* Accessibility: Hidden title for screen readers */}
        <DialogTitle className="sr-only">Past Note Details</DialogTitle>

        {/* Fixed Header - doesn't scroll */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-background shrink-0">
          {/* Left side: Date */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">
              {formattedDate || "No date available"}
            </span>

            {/* Go to Note button - next to date */}
            {note?.has_local_version && (
              <Button
                size="sm"
                onClick={() => {
                  router.push(`/notes/${note.id}`);
                }}
              >
                Go to Note
              </Button>
            )}
          </div>

          {/* Right side: Close button only */}
          {showCloseButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {content ? (
            <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground">
              {/*
                Render HTML content with XSS protection.
                Backend converts all markdown to HTML using convert_markdown_to_html().
                - rehypeRaw: Parses HTML into AST nodes
                - rehypeSanitize: Strips dangerous content (XSS protection)
                - remarkGfm: GitHub-flavored markdown support (for any remaining markdown syntax)
              */}
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                components={{
                  // Ensure proper paragraph rendering
                  p: ({ children }) => <p className="mb-4">{children}</p>,
                  // Ensure proper list rendering
                  ul: ({ children }) => <ul className="list-disc ml-6 mb-4 space-y-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal ml-6 mb-4 space-y-2">{children}</ol>,
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  // Ensure proper heading rendering
                  h1: ({ children }) => <h1 className="text-2xl font-semibold mb-4 mt-6">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 mt-5">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 mt-4">{children}</h3>,
                  // Ensure proper strong/bold rendering
                  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-muted-foreground italic">No note content available</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
