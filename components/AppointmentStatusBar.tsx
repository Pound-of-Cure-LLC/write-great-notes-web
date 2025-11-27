"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useTranscriptionStatus,
  type StatusData as BaseStatusData,
  type TranscriptionStatus,
} from "@/contexts/TranscriptionStatusContext";
import type { EMRSettings } from "@/types";
import {
  AlertCircle,
  Check,
  Circle,
  Disc,
  FileText,
  Link2,
  Loader2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface StatusData extends BaseStatusData {
  appointment_id?: string;
  emr_settings?: EMRSettings;
  created_at?: string;
}

interface AppointmentStatusBarProps {
  appointmentId?: string;
  transcriptionStatus?: {
    status: string;
    transcription_id?: string | null;
    note_id?: string | null;
    error_message?: string | null;
    started_at?: string | null;
    created_at?: string | null;
  };
  onStatusChange?: (status: StatusData) => void;
  connectionId?: string | null; // For external EMR appointments
}

/**
 * Format date to local time in format: MM-DD-YYYY HH:MMAM/PM
 * Example: "11-21-2025 11:04AM"
 */
function formatStatusDate(dateString: string | null | undefined): string | null {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    
    // Format: MM-DD-YYYY HH:MMAM/PM
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const hoursStr = String(hours); // Don't pad hours - 12:04AM not 012:04AM
    
    return `${month}-${day}-${year} ${hoursStr}:${minutes}${ampm}`;
  } catch {
    return null;
  }
}

const STATUS_CONFIG = {
  not_recorded: {
    icon: Circle,
    label: "Not Recorded",
    variant: "secondary" as const,
    animated: false,
    pulse: false,
  },
  recording: {
    icon: Disc,
    label: "Recording...",
    variant: "destructive" as const,
    animated: true,
    pulse: true, // Add pulse animation
  },
  recorded: {
    icon: Disc,
    label: "Recorded",
    variant: "destructive" as const,
    animated: false,
    pulse: false,
  },
  processing: {
    icon: Loader2,
    label: "Processing...",
    variant: "default" as const,
    animated: true,
    pulse: false,
  },
  completed: {
    icon: FileText,
    label: "Note Generated",
    variant: "default" as const,
    animated: false,
    pulse: false,
  },
  failed: {
    icon: AlertCircle,
    label: "Failed",
    variant: "destructive" as const,
    animated: false,
    pulse: false,
  },
  cancelled: {
    icon: AlertCircle,
    label: "Cancelled",
    variant: "secondary" as const,
    animated: false,
    pulse: false,
  },
  pushed_to_emr: {
    icon: Link2,
    label: "Pushed to EMR",
    variant: "default" as const,
    animated: false,
    pulse: false,
  },
  signed: {
    icon: Check,
    label: "Signed",
    variant: "default" as const,
    animated: false,
    pulse: false,
  },
};

export function AppointmentStatusBar({
  appointmentId,
  transcriptionStatus,
  onStatusChange,
  connectionId,
}: AppointmentStatusBarProps) {
  const { statuses, subscribe } = useTranscriptionStatus();
  // Extract transcription_id directly from transcriptionStatus (backend always provides this)
  const transcriptionId = transcriptionStatus?.transcription_id || null;
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // Ensure transcription is subscribed for realtime updates
  useEffect(() => {
    if (transcriptionId) {
      subscribe(transcriptionId);
    }
  }, [transcriptionId, subscribe]);

  // Get status from context - directly access statuses object (not via function call)
  // This ensures component re-renders when statuses changes
  const statusDataFromContext = transcriptionId
    ? statuses[transcriptionId]?.statusData
    : null;

  // Build final statusData - memoized to prevent infinite loops
  // Use realtime status from context if available, otherwise fall back to initial transcriptionStatus from API
  const statusData: StatusData | null = useMemo(() => {
    // Prefer realtime status from context (most up-to-date)
    if (statusDataFromContext) {
      return {
        status: statusDataFromContext.status as TranscriptionStatus,
        ...(statusDataFromContext.transcription_id && {
          transcription_id: statusDataFromContext.transcription_id,
        }),
        ...(statusDataFromContext.note_id && {
          note_id: statusDataFromContext.note_id,
        }),
        ...(statusDataFromContext.error_message && {
          error_message: statusDataFromContext.error_message,
        }),
        ...(statusDataFromContext.started_at && {
          started_at: statusDataFromContext.started_at,
        }),
        ...(statusDataFromContext.created_at && {
          created_at: statusDataFromContext.created_at,
        }),
      };
    }

    // Fall back to initial status from API response
    if (transcriptionStatus) {
      return {
        status: transcriptionStatus.status as TranscriptionStatus,
        ...(transcriptionStatus.transcription_id && {
          transcription_id: transcriptionStatus.transcription_id,
        }),
        ...(transcriptionStatus.note_id && {
          note_id: transcriptionStatus.note_id,
        }),
        ...(transcriptionStatus.error_message && {
          error_message: transcriptionStatus.error_message,
        }),
        ...(transcriptionStatus.started_at && {
          started_at: transcriptionStatus.started_at,
        }),
        ...((transcriptionStatus as any).created_at && {
          created_at: (transcriptionStatus as any).created_at,
        }),
      };
    }

    // Default to not_recorded if no status available
    return { status: "not_recorded" };
  }, [statusDataFromContext, transcriptionStatus]);

  // Notify parent of status changes - only when status actually changes
  const prevStatusRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (statusData && statusData.status !== prevStatusRef.current) {
      prevStatusRef.current = statusData.status;
      onStatusChange?.(statusData);
    }
  }, [statusData?.status, statusData, onStatusChange]);

  // Track elapsed time for processing status
  useEffect(() => {
    if (statusData?.status === "processing" && statusData.started_at) {
      const startTime = new Date(statusData.started_at).getTime();
      const interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setElapsedTime(0);
    }
  }, [statusData?.status, statusData?.started_at]);

  if (!statusData) {
    return null;
  }

  const config = STATUS_CONFIG[statusData.status];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex">
            <Icon
              className={`h-5 w-5 ${
                config.animated && !config.pulse ? "animate-spin" : ""
              } ${
                config.pulse
                  ? "animate-pulse text-red-600 fill-red-600"
                  : "text-muted-foreground"
              }`}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.label}</p>
          {statusData.error_message && (
            <p className="text-xs text-destructive">
              {statusData.error_message}
            </p>
          )}
          {statusData.status === "processing" && elapsedTime > 0 && (
            <p className="text-xs">{elapsedTime} seconds elapsed</p>
          )}
          {statusData.created_at && (
            <p className="text-xs text-muted-foreground mt-1">
              Updated: {formatStatusDate(statusData.created_at)}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
