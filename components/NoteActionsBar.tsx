"use client";

import { NoteRegenerationModal } from "@/components/NoteRegenerationModal";
import { TemplateModificationModal } from "@/components/TemplateModificationModal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranscriptionStatus } from "@/contexts/TranscriptionStatusContext";
import { apiPost } from "@/lib/api-client";
import { CAPABILITIES, useCapabilities } from "@/lib/capabilities";
import {
  AlertCircle,
  CheckCircle,
  Copy,
  FileText,
  Loader2,
  MoreHorizontal,
  Printer,
  RefreshCw,
  Settings,
  Upload,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { logger } from "@/lib/logger";
interface NoteActionsBarProps {
  transcriptionId: string | null;
  appointmentId: string;
  visitTypeId?: string | null;
  viewMode?: "sections" | "full";
  onViewModeChange?: (mode: "sections" | "full") => void;
  onCopyFullNote?: () => void;
  onPrintNote?: () => void;
  copiedFull?: boolean;
  onGenerate?: () => void;
  onViewNote?: () => void;
  onRegenerate?: () => void;
  canGenerate?: boolean;
  className?: string;
  showInlineOnly?: boolean; // When true, only render Generate Note button (for inline placement)
  editTemplateMode?: "redirect" | "modal"; // "redirect" = go directly to settings, "modal" = open sidebar modal
  editTemplateLabel?: string; // Label for the edit template option (default: "Edit Template")
}

/**
 * NoteActionsBar: Unified action bar for note pages
 *
 * Displays two dropdown menus:
 * - Views: Edit View, Full Note View, Copy Full Note
 * - Notes: Regenerate Note, Push to EMR, Push to EMR & Sign, Sign Note, Edit Template
 *
 * Subscribes to transcription_status for realtime updates
 */
export const NoteActionsBar = memo(function NoteActionsBar({
  transcriptionId,
  appointmentId,
  visitTypeId,
  viewMode,
  onViewModeChange,
  onCopyFullNote,
  onPrintNote,
  copiedFull = false,
  onGenerate,
  onViewNote,
  onRegenerate,
  canGenerate = true,
  className,
  showInlineOnly = false,
  editTemplateMode = "modal", // Default to modal for backward compatibility
  editTemplateLabel = "Edit Template", // Default label for backward compatibility
}: NoteActionsBarProps) {
  const router = useRouter();
  const { statuses, getStatus, subscribe, unsubscribe, refresh } =
    useTranscriptionStatus();
  const [isPushing, setIsPushing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  // Use ref to track pushing state synchronously (prevents race conditions)
  const isPushingRef = useRef(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogTitle, setErrorDialogTitle] = useState("");
  const [errorDialogMessage, setErrorDialogMessage] = useState("");
  const [failureDialogOpen, setFailureDialogOpen] = useState(false);
  const [templateModModalOpen, setTemplateModModalOpen] = useState(false);
  const [regenerationModalOpen, setRegenerationModalOpen] = useState(false);
  const [regenerationError, setRegenerationError] = useState("");

  const { has } = useCapabilities();

  // Get current status and note from context - directly access statuses object
  // This ensures component re-renders when statuses changes
  const statusData = transcriptionId
    ? statuses[transcriptionId]?.statusData
    : null;
  const note = transcriptionId ? statuses[transcriptionId]?.note : null;
  const isLoading = transcriptionId
    ? statuses[transcriptionId]?.isLoading
    : false;

  // Extract status values (use defaults to ensure hooks always run)
  const status = statusData?.status;
  const isRecorded = status === "recorded";
  const isProcessing = status === "processing";
  const isCompleted = status === "completed";
  const isFailed = status === "failed";
  const isPushed = status === "pushed_to_emr";
  const isSigned = status === "signed";

  const canPushToEMR = has(CAPABILITIES.PUSH_NOTE_TO_EMR);
  const canPushAndSign = has(CAPABILITIES.PUSH_NOTE_TO_EMR_AND_SIGN);
  const canSign = has(CAPABILITIES.SIGN_NOTE);

  // Debug: Log status changes
  useEffect(() => {
    if (transcriptionId && statusData) {
      logger.debug(
        `[NoteActionsBar] Status for ${transcriptionId}:`,
        statusData.status
      );
    }
  }, [transcriptionId, statusData?.status]);

  // Open failure dialog when status becomes failed
  useEffect(() => {
    if (statusData?.status === "failed") {
      setFailureDialogOpen(true);
    }
  }, [statusData?.status]);

  // Clear regenerating state when status becomes "processing" (realtime update received)
  useEffect(() => {
    if (statusData?.status === "processing" && isRegenerating) {
      setIsRegenerating(false);
    }
  }, [statusData?.status, isRegenerating]);

  // Debug logging for button visibility (helpful for diagnosing push to EMR issues)
  // MUST be called before any early returns to maintain hook order
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && transcriptionId) {
      logger.debug("[NoteActionsBar] Button visibility state:", {
        status,
        isCompleted,
        isPushed,
        isSigned,
        canPushToEMR,
        canPushAndSign,
        canSign,
        hasNote: !!note,
        noteId: note?.id,
        statusDataNoteId: statusData?.note_id,
        shouldShowPushButton:
          canPushToEMR && (isCompleted || isPushed) && !isSigned,
      });
    }
  }, [status, isCompleted, isPushed, isSigned, canPushToEMR, canPushAndSign, canSign, note, statusData, transcriptionId]);

  // Early return AFTER all hooks have been called
  if (isLoading || !statusData) {
    return null;
  }

  // Push note to EMR
  const handlePushToEMR = async (signAfterPush: boolean = false) => {
    logger.info("[NoteActionsBar] handlePushToEMR called", {
      signAfterPush,
      statusData,
      note,
      transcriptionId,
      hasStatusDataNoteId: !!statusData?.note_id,
      hasNoteId: !!note?.id,
    });

    // Get note_id from statusData or note object (fallback)
    const noteId = statusData?.note_id || note?.id;

    if (!noteId) {
      logger.error(
        "Cannot push to EMR: note_id not found in statusData or note object",
        {
          statusData,
          note,
          transcriptionId,
          statusDataKeys: statusData ? Object.keys(statusData) : null,
          noteKeys: note ? Object.keys(note) : null,
        }
      );
      toast.error("Note ID not found. Please refresh the page and try again.");
      return;
    }

    logger.info(`[NoteActionsBar] Pushing note ${noteId} to EMR...`, {
      signAfterPush,
    });

    // Prevent multiple simultaneous pushes using ref for synchronous check
    if (isPushingRef.current) {
      logger.warn(
        "Push to EMR already in progress, ignoring duplicate request"
      );
      return;
    }

    isPushingRef.current = true;
    setIsPushing(true);
    try {
      logger.info(`Pushing note ${noteId} to EMR...`, { signAfterPush });
      const response = await apiPost(`/notes/${noteId}/push-to-emr`, {
        sign_after_push: signAfterPush,
      });

      // Log response for debugging
      logger.info("Push to EMR response:", response);

      toast.success(
        signAfterPush
          ? "Note pushed to EMR and signed successfully"
          : "Note pushed to EMR successfully"
      );

      // Backend will broadcast status update via realtime
      // Context will automatically update
      // Add manual refresh as fallback if realtime doesn't update within 2 seconds
      if (transcriptionId) {
        setTimeout(() => {
          try {
            const currentStatus = getStatus(transcriptionId);
            // If status hasn't updated to pushed_to_emr yet, manually refresh
            if (
              currentStatus?.status !== "pushed_to_emr" &&
              currentStatus?.status !== "signed"
            ) {
              logger.info(
                "Realtime update delayed, manually refreshing status"
              );
              // Trigger a manual status fetch by calling subscribe again
              // The subscribe function will fetch the latest status
              subscribe(transcriptionId);
            }
          } catch (err) {
            logger.error("Error checking status after push:", err);
          }
        }, 2000);
      }
    } catch (error: any) {
      logger.error("Error pushing note to EMR:", error);
      
      // Check if this is a regeneration required error
      if (error?.error_code === "NOTE_REGENERATION_REQUIRED") {
        const message = error.detail || "This note needs to be regenerated before pushing to EMR.";
        setRegenerationError(message);
        setRegenerationModalOpen(true);
      } else {
        // Handle other errors normally
        const message =
          error instanceof Error ? error.message : "Failed to push note to EMR";

        setErrorDialogTitle("Error Pushing Note");
        setErrorDialogMessage(message);
        setErrorDialogOpen(true);
        toast.error(message);
      }
    } finally {
      isPushingRef.current = false;
      setIsPushing(false);
    }
  };

  // Sign note
  const handleSignNote = async () => {
    // Get note_id from statusData or note object (fallback)
    const noteId = statusData?.note_id || note?.id;

    if (!noteId) {
      logger.error(
        "Cannot sign note: note_id not found in statusData or note object",
        {
          statusData,
          note,
          transcriptionId,
        }
      );
      toast.error("Note ID not found. Please refresh the page and try again.");
      return;
    }

    setIsPushing(true);
    try {
      logger.info(`Signing note ${noteId}...`);
      await apiPost(`/notes/${noteId}/sign`, {});

      toast.success("Note signed successfully");

      // Backend will broadcast status update via realtime
      // Context will automatically update
    } catch (error) {
      logger.error("Error signing note:", error);
      const message =
        error instanceof Error ? error.message : "Failed to sign note";

      setErrorDialogTitle("Error Signing Note");
      setErrorDialogMessage(message);
      setErrorDialogOpen(true);
    } finally {
      setIsPushing(false);
    }
  };

  // Handle regenerate note
  const handleRegenerateNote = async () => {
    if (onRegenerate) {
      setIsRegenerating(true);
      try {
        await onRegenerate();
        // Loading state will be cleared when status becomes "processing" via useEffect below
      } catch (error) {
        setIsRegenerating(false);
        // Error handling is done in the onRegenerate handler
      }
      return;
    }

    // Default regenerate implementation
    if (!transcriptionId) return;

    setIsRegenerating(true);
    try {
      await apiPost(`/notes/generate`, {
        transcription_id: transcriptionId,
      });

      toast.success("Note regeneration started. This may take a moment...");

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      logger.error("Error regenerating note:", error);
      const message =
        error instanceof Error ? error.message : "Failed to regenerate note";

      setErrorDialogTitle("Error Regenerating Note");
      setErrorDialogMessage(message);
      setErrorDialogOpen(true);
    } finally {
      setIsRegenerating(false);
    }
  };

  // Handle cancel note generation
  const handleCancelNoteGeneration = async () => {
    if (!transcriptionId) return;

    setIsCancelling(true);
    try {
      await apiPost(
        `/transcription-status/${transcriptionId}/cancel-note-generation`,
        {}
      );

      toast.success("Note generation cancelled");

      // Backend inserts new status record which should trigger realtime update
      // But as a fallback, manually refresh status after a short delay
      // to ensure UI updates even if realtime event is missed
      setTimeout(async () => {
        try {
          // Manually refresh status to ensure UI updates
          await refresh(transcriptionId);
          logger.info("Manually refreshed status after cancel");
        } catch (error) {
          logger.error("Error refreshing status after cancel:", error);
        }
      }, 500); // Small delay to allow backend to process the INSERT
    } catch (error) {
      logger.error("Error cancelling note generation:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to cancel note generation";

      setErrorDialogTitle("Error Cancelling Note Generation");
      setErrorDialogMessage(message);
      setErrorDialogOpen(true);
    } finally {
      setIsCancelling(false);
    }
  };

  const canShowActions =
    isRecorded ||
    isProcessing ||
    isCompleted ||
    isFailed ||
    isPushed ||
    isSigned;

  if (!canShowActions) {
    return null;
  }

  // Inline mode: only render Generate Note button
  if (showInlineOnly) {
    if (isRecorded && onGenerate) {
      return (
        <Button onClick={onGenerate} disabled={!canGenerate} size="default">
          Generate Note
        </Button>
      );
    }
    return null;
  }

  return (
    <div className={className}>
      {/* Status: recorded - Show "Generate Note" button */}
      {isRecorded && onGenerate && (
        <div className="flex justify-end">
          <Button onClick={onGenerate} disabled={!canGenerate} size="default" className="text-sm sm:text-base">
            Generate Note
          </Button>
        </div>
      )}

      {/* Status: processing - Show "Generating note..." with spinner and Cancel button */}
      {isProcessing && (
        <div className="flex justify-end gap-2 flex-wrap">
          <Button disabled size="default" isLoading className="text-sm sm:text-base">
            <span className="hidden sm:inline">Generating note</span>
            <span className="sm:hidden">Generating...</span>
          </Button>
          <Button
            onClick={handleCancelNoteGeneration}
            isLoading={isCancelling}
            loadingText="Cancelling"
            variant="destructive"
            size="default"
            className="text-sm sm:text-base"
          >
            <XCircle className="h-4 w-4 mr-1 sm:mr-2" />
            Cancel
          </Button>
        </div>
      )}

      {/* Status: failed - Show retry button */}
      {isFailed && (
        <div className="flex justify-end">
          <Button
            onClick={handleRegenerateNote}
            isLoading={isRegenerating}
            loadingText="Retrying"
            variant="default"
            size="default"
            className="text-sm sm:text-base"
          >
            <RefreshCw className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Retry Note Generation</span>
            <span className="sm:hidden">Retry</span>
          </Button>
        </div>
      )}

      {/* Status: completed, pushed_to_emr, signed - Show dropdown menus */}
      {(isCompleted || isPushed || isSigned) && (
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Left: Views Dropdown */}
          {(onViewModeChange || onCopyFullNote || onPrintNote) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="default" className="text-sm sm:text-base">
                  <span>Views</span>
                  <MoreHorizontal className="h-4 w-4 ml-1 sm:ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {/* View Transcription - Always show */}
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/appointments/${appointmentId}/transcribe`)
                  }
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Transcription
                </DropdownMenuItem>

                {onViewModeChange && (
                  <>
                    <DropdownMenuItem
                      onClick={() => onViewModeChange("sections")}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Edit View
                      {viewMode === "sections" && (
                        <CheckCircle className="h-4 w-4 ml-auto" />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onViewModeChange("full")}>
                      <FileText className="h-4 w-4 mr-2" />
                      Full Note View
                      {viewMode === "full" && (
                        <CheckCircle className="h-4 w-4 ml-auto" />
                      )}
                    </DropdownMenuItem>
                  </>
                )}
                {onCopyFullNote && (
                  <DropdownMenuItem onClick={onCopyFullNote}>
                    {copiedFull ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Full Note
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                {onPrintNote && (
                  <DropdownMenuItem onClick={onPrintNote}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Right: Notes Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="default" className="text-sm sm:text-base">
                <span className="hidden sm:inline">Note Options</span>
                <span className="sm:hidden">Options</span>
                <MoreHorizontal className="h-4 w-4 ml-1 sm:ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* View Note - Show for all statuses (completed/pushed/signed) */}
              {onViewNote && note && (
                <DropdownMenuItem
                  onClick={() => router.push(`/notes/${note.id}`)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Note
                </DropdownMenuItem>
              )}

              {/* Regenerate Note - Show for completed/pushed_to_emr, hide for signed */}
              {(isCompleted || isPushed) && !isSigned && (
                <DropdownMenuItem
                  onClick={handleRegenerateNote}
                  disabled={isRegenerating}
                >
                  {isRegenerating && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {!isRegenerating && <RefreshCw className="h-4 w-4 mr-2" />}
                  {isRegenerating ? "Regenerating..." : "Regenerate Note"}
                </DropdownMenuItem>
              )}

              {/* Push to EMR - Show for completed/pushed_to_emr, hide for signed */}
              {canPushToEMR && (isCompleted || isPushed) && !isSigned && (
                <DropdownMenuItem
                  onClick={() => handlePushToEMR(false)}
                  disabled={isPushing}
                >
                  {isPushing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {isPushing ? "Pushing..." : "Push to EMR"}
                </DropdownMenuItem>
              )}

              {/* Push to EMR and Sign - Show for completed/pushed_to_emr, hide for signed */}
              {canPushAndSign && (isCompleted || isPushed) && !isSigned && (
                <DropdownMenuItem
                  onClick={() => handlePushToEMR(true)}
                  disabled={isPushing}
                >
                  {isPushing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {isPushing ? "Pushing..." : "Push to EMR & Sign"}
                </DropdownMenuItem>
              )}

              {/* Sign Note - Local DB only, show for completed/pushed_to_emr */}
              {canSign && !canPushToEMR && (isCompleted || isPushed) && (
                <DropdownMenuItem
                  onClick={note?.is_signed ? undefined : handleSignNote}
                  disabled={isPushing || !!note?.is_signed}
                >
                  {isPushing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  {note?.is_signed
                    ? "Signed"
                    : isPushing
                    ? "Signing..."
                    : "Sign Note"}
                </DropdownMenuItem>
              )}

              {/* Edit Template - Always show if visit type exists */}
              {visitTypeId && (
                <DropdownMenuItem
                  onClick={() => {
                    if (editTemplateMode === "redirect") {
                      // Redirect directly to settings page with visit_type query param
                      router.push(
                        `/settings/note-sections?visit_type=${visitTypeId}`
                      );
                    } else {
                      // Open modal sidebar
                      setTemplateModModalOpen(true);
                    }
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {editTemplateLabel}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Error Dialog */}
      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{errorDialogTitle}</DialogTitle>
            <DialogDescription className="pt-4">
              {errorDialogMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setErrorDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Failure Dialog - Shown when note generation fails */}
      <Dialog open={failureDialogOpen} onOpenChange={setFailureDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Note Generation Failed
            </DialogTitle>
            <DialogDescription className="pt-4">
              {statusData?.error_message ||
                "An error occurred while generating the note. Please try again."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setFailureDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setFailureDialogOpen(false);
                handleRegenerateNote();
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Modification Modal */}
      {visitTypeId && (
        <TemplateModificationModal
          open={templateModModalOpen}
          onOpenChange={setTemplateModModalOpen}
          visitTypeId={visitTypeId}
        />
      )}

      {/* Note Regeneration Modal */}
      <NoteRegenerationModal
        open={regenerationModalOpen}
        onClose={() => setRegenerationModalOpen(false)}
        onRegenerate={() => {
          setRegenerationModalOpen(false);
          handleRegenerateNote();
        }}
        errorMessage={regenerationError}
      />
    </div>
  );
});
