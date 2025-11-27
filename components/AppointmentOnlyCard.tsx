"use client";

import { AppointmentStatusBar } from "@/components/AppointmentStatusBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { StatusData } from "@/contexts/TranscriptionStatusContext";
import { formatAppointmentDateTime } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { useCapabilitiesStore } from "@/store/capabilitiesStore";
import { Calendar, Video } from "lucide-react";
import { useState } from "react";

interface AppointmentOnlyCardProps {
  appointment: {
    id: string;
    appointment_datetime: string;
    is_telemed?: boolean;
    appointment_details?: string | null;
    connection_id?: string | null;
    provider_name?: string | null; // Provider/physician name
    visit_type?: {
      name: string;
    } | null;
    transcription_status?: {
      status:
        | "not_recorded"
        | "recording"
        | "recorded"
        | "processing"
        | "completed"
        | "failed"
        | "pushed_to_emr"
        | "signed";
      transcription_id?: string | null;
      note_id?: string | null;
      error_message?: string | null;
      started_at?: string | null;
    };
    emr_settings?: {
      emr_visit_type?: string;
      appointment_status?: string;
      reason_for_appointment?: string;
      [key: string]: any;
    };
  };
  onClick?: () => void;
  className?: string;
  onStatusChange?: (status: StatusData) => void;
}

/**
 * AppointmentOnlyCard: Simplified appointment card for patient detail pages
 *
 * Shows only appointment-specific information (no patient details):
 * - Appointment date/time
 * - Visit type
 * - Status
 * - Appointment message/reason
 *
 * Size: 650px width, auto height
 */
export function AppointmentOnlyCard({
  appointment,
  onClick,
  className,
  onStatusChange,
}: AppointmentOnlyCardProps) {
  const [isFetchingTelemed, setIsFetchingTelemed] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const hasCapability = useCapabilitiesStore((state) => state.hasCapability);

  // Check if telemed is supported by current adapter
  const hasTelemedCapability = hasCapability("has_telemed");

  return (
    <>
      <Card
        className={cn(
          "w-full max-w-[650px] h-auto overflow-hidden flex flex-col",
          onClick && "cursor-pointer hover:bg-muted/50 transition-colors",
          className
        )}
        onClick={onClick}
        data-testid={`appointment-only-card-${appointment.id}`}
      >
        {/* Main Card Body */}
        <div className="flex flex-col">
          {/* Appointment Date/Time and Visit Type Row */}
          <div className="flex flex-col gap-2 px-3 py-2 border-b border-border bg-gradient-to-r from-uranian-blue/10 to-uranian-blue/20 md:flex-row md:items-center md:justify-between md:gap-0">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Calendar Icon */}
              <Calendar className="h-4 w-4 text-uranian-blue shrink-0" />
              {/* Status Indicator */}
              <AppointmentStatusBar
                appointmentId={appointment.id}
                {...(appointment.transcription_status && {
                  transcriptionStatus: appointment.transcription_status,
                })}
                {...(appointment.connection_id && {
                  connectionId: appointment.connection_id,
                })}
                {...(onStatusChange && { onStatusChange })}
              />
              {/* Date and Time */}
              <span className="text-sm font-medium text-foreground">
                {formatAppointmentDateTime(appointment.appointment_datetime)}
              </span>
              {/* Provider Name */}
              {appointment.provider_name && (
                <span className="text-xs text-muted-foreground">
                  with{" "}
                  <span className="font-bold">{appointment.provider_name}</span>
                </span>
              )}
            </div>
            {/* Visit Type (right-justified on desktop, stacked on mobile) - Only show if there's content to display */}
            {(appointment.visit_type?.name ||
              appointment.emr_settings?.emr_visit_type ||
              appointment.is_telemed) && (
              <div className="flex items-center gap-2 flex-wrap">
                {appointment.visit_type?.name && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-jordy-blue/20 text-jordy-blue border-jordy-blue/30"
                  >
                    {appointment.visit_type.name}
                  </Badge>
                )}
                {appointment.emr_settings?.emr_visit_type &&
                  appointment.emr_settings.emr_visit_type !==
                    appointment.visit_type?.name && (
                    <Badge
                      variant="outline"
                      className="text-xs text-muted-foreground"
                    >
                      {appointment.emr_settings.emr_visit_type}
                    </Badge>
                  )}
                {/* Telemed Icon - DEACTIVATED: Not clickable (see handleTelemedClick comment above) */}
                {/* onClick removed - uncomment handleTelemedClick above to re-enable */}
                {appointment.is_telemed && (
                  <Badge
                    variant="outline"
                    className="text-xs flex items-center gap-1"
                  >
                    <Video className="h-3 w-3" />
                    Telemed
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Appointment Message Row */}
          {(appointment.emr_settings?.appointment_status ||
            appointment.emr_settings?.reason_for_appointment ||
            appointment.appointment_details) && (
            <div className="px-3 py-2 text-xs">
              {/* Display status and reason on same line with status in bold */}
              {appointment.emr_settings?.appointment_status && (
                <div className="text-foreground">
                  <span className="font-bold">
                    {appointment.emr_settings.appointment_status}
                  </span>
                  {appointment.emr_settings.reason_for_appointment && (
                    <span>
                      {" "}
                      | {appointment.emr_settings.reason_for_appointment}
                    </span>
                  )}
                </div>
              )}

              {/* Fallback to appointment_details if no status/reason parsed */}
              {!appointment.emr_settings?.appointment_status &&
                appointment.appointment_details && (
                  <div className="text-muted-foreground">
                    {appointment.appointment_details}
                  </div>
                )}
            </div>
          )}
        </div>
      </Card>

      {/* Error Dialog */}
      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Telemed Session Unavailable</DialogTitle>
            <DialogDescription>{errorMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setErrorDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
