"use client";

import { Card } from "@/components/ui/card";
import { AppointmentStatusBar } from "@/components/AppointmentStatusBar";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate, formatAppointmentDateTime, calculateAge, getInitials } from "@/lib/date-utils";

interface PatientCardProps {
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    mrn?: string | null;
    date_of_birth?: string | null;
    gender?: string | null;
    phone?: string | null;
    email?: string | null;
    last_appointment?: string | null;
    last_appointment_id?: string | null;
    next_appointment?: string | null;
    next_appointment_id?: string | null;
    phr_login_id?: string | null;
  };
  onClick?: () => void;
  className?: string;
  showAppointments?: boolean; // Toggle appointment footer visibility
  compact?: boolean; // Compact mode - only show name, DOB, gender, MRN
}

/**
 * PatientCard: Reusable patient information card component
 *
 * Features:
 * - Patient avatar with initials
 * - Name, MRN, demographics (DOB, phone, email, gender)
 * - Last/next appointment dates with status indicators
 * - Responsive grid layout
 * - Click handler for navigation
 * - Dark mode support
 * - Compact mode for patient list views
 *
 * Usage:
 * <PatientCard
 *   patient={patientData}
 *   onClick={() => router.push(`/patients/${patient.id}`)}
 *   showAppointments={true}
 *   compact={false}
 * />
 */
export function PatientCard({
  patient,
  onClick,
  className,
  showAppointments = true,
  compact = false,
}: PatientCardProps) {
  const initials = getInitials(patient.first_name, patient.last_name);

  // Compact mode - simplified layout
  if (compact) {
    return (
      <Card
        className={cn(
          "overflow-hidden max-w-[700px] border-l-4 border-jordy-blue",
          onClick && "cursor-pointer hover:bg-muted/50 transition-colors",
          className
        )}
        onClick={onClick}
        data-testid={`patient-card-${patient.id}`}
      >
        <div className="p-4 flex items-center gap-4">
          {/* Name, DOB, Gender, MRN in single row */}
          <div className="flex-grow flex items-center gap-6 text-sm">
            {/* Name */}
            <div className="min-w-[180px]">
              <div className="flex items-center gap-2">
                {patient.phr_login_id && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <User className="h-4 w-4 text-primary" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Patient Portal Access</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <span className="font-semibold text-foreground">
                  {patient.first_name} {patient.last_name}
                </span>
              </div>
            </div>

            {/* DOB */}
            {patient.date_of_birth && (
              <div className="min-w-[120px] text-muted-foreground">
                {formatDate(patient.date_of_birth)}
                {calculateAge(patient.date_of_birth) !== null && (
                  <span> ({calculateAge(patient.date_of_birth)})</span>
                )}
              </div>
            )}

            {/* Gender */}
            {patient.gender && (
              <div className="min-w-[80px] text-muted-foreground capitalize">
                {patient.gender}
              </div>
            )}

            {/* MRN */}
            {patient.mrn && (
              <div className="min-w-[100px] text-muted-foreground">
                MRN: {patient.mrn}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Full mode - original detailed layout
  return (
    <Card
      className={cn(
        "overflow-hidden max-w-[700px] border-l-4 border-jordy-blue",
        onClick && "cursor-pointer hover:bg-muted/50 transition-colors",
        className
      )}
      onClick={onClick}
      data-testid={`patient-card-${patient.id}`}
    >
      {/* Main Content */}
      <div className="p-6 flex items-center">
        <div className="flex items-center gap-6 w-full">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-jordy-blue/10 flex items-center justify-center border-2 border-jordy-blue/20">
              <span className="text-lg font-semibold text-jordy-blue">
                {initials}
              </span>
            </div>
          </div>

          {/* Patient Info Grid - Compact layout - 40/30/30 split */}
          <div className="flex-grow grid grid-cols-1 md:grid-cols-10 gap-x-3 gap-y-1 items-center">
            {/* Name and MRN - 40% (4 of 10 columns) */}
            <div className="md:col-span-4">
              <div className="flex items-center gap-2">
                {patient.phr_login_id && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <User className="h-4 w-4 text-primary" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Patient Portal Access</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <h2 className="text-base font-bold text-foreground">
                  {patient.first_name} {patient.last_name}
                </h2>
              </div>
              {patient.mrn && (
                <p className="text-xs text-muted-foreground">
                  {patient.mrn}
                </p>
              )}
            </div>

            {/* Middle Column - 30% (3 of 10 columns) - DOB and Gender */}
            <div className="md:col-span-3 space-y-1 text-xs">
              {patient.date_of_birth && (
                <p className="text-card-foreground font-medium">
                  {formatDate(patient.date_of_birth)}
                  {calculateAge(patient.date_of_birth) !== null && (
                    <span> ({calculateAge(patient.date_of_birth)})</span>
                  )}
                </p>
              )}
              {patient.gender && (
                <p className="text-card-foreground capitalize">
                  {patient.gender}
                </p>
              )}
            </div>

            {/* Right Column - 30% (3 of 10 columns) - Phone and Email */}
            <div className="md:col-span-3 space-y-1 text-xs">
              {patient.phone && (
                <p className="text-card-foreground">
                  {patient.phone}
                </p>
              )}
              {patient.email && (
                <p className="text-card-foreground truncate">
                  {patient.email}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Footer */}
      {showAppointments && (patient.last_appointment || patient.next_appointment) && (
        <div className="bg-gradient-to-r from-jordy-blue/10 to-jordy-blue/20 px-3 py-2 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Last Appointment */}
          {patient.last_appointment && (
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                Last Appointment:
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">
                  {formatAppointmentDateTime(patient.last_appointment)}
                </p>
                {patient.last_appointment_id && (
                  <AppointmentStatusBar
                    appointmentId={patient.last_appointment_id}
                  />
                )}
              </div>
            </div>
          )}

          {/* Next Appointment */}
          {patient.next_appointment && (
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                Next Visit:
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">
                  {formatAppointmentDateTime(patient.next_appointment)}
                </p>
                {patient.next_appointment_id && (
                  <AppointmentStatusBar
                    appointmentId={patient.next_appointment_id}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
