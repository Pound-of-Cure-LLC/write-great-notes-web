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
import { formatAppointmentDateTime, formatDateLong } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { useCapabilitiesStore } from "@/store/capabilitiesStore";
import {
  Calendar,
  Mail,
  Pencil,
  Phone,
  Trash2,
  User,
  Video,
} from "lucide-react";
import { useState } from "react";

interface AppointmentCardProps {
  appointment: {
    id: string;
    appointment_datetime: string;
    is_telemed?: boolean;
    appointment_details?: string | null;
    connection_id?: string | null; // For external EMR appointments
    provider_name?: string | null; // Provider/physician name
    patient: {
      first_name: string;
      last_name: string;
      mrn?: string | null;
      date_of_birth?: string | null;
      gender?: string | null;
      phone?: string | null;
      email?: string | null;
    };
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
  };
  onClick?: () => void;
  className?: string;
  show_edit_delete?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (status: StatusData) => void;
}

/**
 * AppointmentCard: Redesigned appointment card component
 *
 * Layout:
 * - Top-left: Status indicator
 * - Top-right: Telemed icon (if applicable)
 * - Center: Patient name (prominent)
 * - Below: Demographics in clean grid (DOB, gender, phone, email)
 * - Bottom: Appointment details message
 * - Left sidebar: Time
 * - Right sidebar: Edit/Delete buttons
 *
 * Size: 600px width, auto height
 */
export function AppointmentCard({
  appointment,
  onClick,
  className,
  show_edit_delete = true,
  onEdit,
  onDelete,
  onStatusChange,
}: AppointmentCardProps) {
  const [isFetchingTelemed, setIsFetchingTelemed] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const hasCapability = useCapabilitiesStore((state) => state.hasCapability);

  // Check if telemed is supported by current adapter
  const hasTelemedCapability = hasCapability("has_telemed");

  // Check if appointment has been recorded (any status beyond "not_recorded")
  const isRecorded =
    appointment.transcription_status &&
    appointment.transcription_status.status !== "not_recorded";

  return (
    <>
      <Card
        className={cn(
          "w-full max-w-[700px] h-auto overflow-hidden flex flex-col relative",
          onClick && "cursor-pointer hover:bg-muted/50 transition-colors",
          className
        )}
        onClick={onClick}
        data-testid={`appointment-card-${appointment.id}`}
      >
        {/* Dark overlay for recorded appointments */}
        {isRecorded && (
          <div className="absolute inset-0 bg-black/15 pointer-events-none z-10" />
        )}

        {/* Main Card Body */}
        <div className="flex flex-col relative z-0">
          {/* Appointment Date/Time and Visit Type Row */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-gradient-to-r from-uranian-blue/10 to-uranian-blue/20">
            <div className="flex items-center gap-2">
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
            {/* Visit Type (right-justified) */}
            {appointment.visit_type && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {appointment.visit_type.name}
                </Badge>
              </div>
            )}
          </div>

          {/* Main Content Row */}
          <div className="flex">
            {/* Main Content */}
            <div className="flex-grow px-3 py-2 flex flex-col">
              {/* Header Row: Patient Name, MRN, and Telemed Icon */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {/* Patient Name */}
                  <h2 className="text-base font-bold text-foreground">
                    {appointment.patient.first_name}{" "}
                    {appointment.patient.last_name}
                  </h2>
                  {appointment.patient.mrn && (
                    <span className="text-xs text-muted-foreground">
                      MRN: {appointment.patient.mrn}
                    </span>
                  )}
                </div>

                {/* Telemed Icon - DEACTIVATED: Not clickable (see handleTelemedClick comment above) */}
                {/* onClick removed - uncomment handleTelemedClick above to re-enable */}
                {appointment.is_telemed && (
                  <div className="flex items-center gap-1 text-primary">
                    <Video
                      className="h-4 w-4"
                      aria-label="Telemed appointment"
                    />
                    <span className="text-xs font-medium">Telemed</span>
                  </div>
                )}
              </div>

              {/* Demographics Grid - Compact */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-1">
                {/* DOB */}
                {appointment.patient.date_of_birth && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <p className="text-card-foreground text-xs">
                      {formatDateLong(appointment.patient.date_of_birth)}
                    </p>
                  </div>
                )}

                {/* Gender */}
                {appointment.patient.gender && (
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <p className="text-card-foreground text-xs capitalize">
                      {appointment.patient.gender}
                    </p>
                  </div>
                )}

                {/* Phone */}
                {appointment.patient.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <p className="text-card-foreground text-xs">
                      {appointment.patient.phone}
                    </p>
                  </div>
                )}

                {/* Email */}
                {appointment.patient.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <p className="text-card-foreground text-xs truncate">
                      {appointment.patient.email}
                    </p>
                  </div>
                )}
              </div>

              {/* Appointment Details Message */}
              {appointment.appointment_details && (
                <div className="text-xs text-muted-foreground border-t border-border pt-1 mt-1">
                  {appointment.appointment_details}
                </div>
              )}
            </div>

            {/* Right Sidebar - Edit/Delete Action Buttons */}
            {show_edit_delete && (onEdit || onDelete) && (
              <div
                className="flex flex-col items-center justify-center gap-0.5 px-1.5 border-l border-border"
                onClick={(e) => e.stopPropagation()}
              >
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onEdit}
                    className="h-6 w-6"
                    aria-label="Edit appointment"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onDelete}
                    className="h-6 w-6"
                    aria-label="Delete appointment"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            )}
          </div>
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
