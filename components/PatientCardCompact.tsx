"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getInitials, formatDate, calculateAge } from "@/lib/date-utils";

interface PatientCardCompactProps {
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    mrn?: string | null;
    date_of_birth?: string | null;
    gender?: string | null;
    last_appointment?: string | null;
    last_appointment_id?: string | null;
  };
  onClick?: () => void;
  className?: string;
}

/**
 * PatientCardCompact: Compact patient card for search results and quick selection
 *
 * Size: 600px × 75px (fixed height)
 *
 * Features:
 * - Smaller avatar (40px)
 * - Single-line layout (horizontal)
 * - Essential info only (name, MRN, DOB, gender)
 * - Hover effect for selection
 *
 * Usage:
 * <PatientCardCompact
 *   patient={patientData}
 *   onClick={() => selectPatient(patient)}
 * />
 */
export function PatientCardCompact({
  patient,
  onClick,
  className,
}: PatientCardCompactProps) {
  const initials = getInitials(patient.first_name, patient.last_name);

  return (
    <Card
      className={cn(
        "w-full max-w-[600px] h-[75px] overflow-hidden border-l-4 border-jordy-blue",
        onClick && "cursor-pointer hover:bg-muted/50 transition-colors",
        className
      )}
      onClick={onClick}
      data-testid={`patient-card-compact-${patient.id}`}
    >
      <div className="p-4 h-full flex items-center gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-jordy-blue/10 flex items-center justify-center border-2 border-jordy-blue/20">
            <span className="text-base font-semibold text-jordy-blue">
              {initials}
            </span>
          </div>
        </div>

        {/* Patient Info - Horizontal Layout */}
        <div className="flex-1 flex items-center gap-6 min-w-0">
          {/* Name and MRN */}
          <div className="flex-shrink-0 w-40">
            <h3 className="text-sm font-bold text-foreground truncate">
              {patient.first_name} {patient.last_name}
            </h3>
            {patient.mrn && (
              <p className="text-xs text-muted-foreground truncate">
                MRN: {patient.mrn}
              </p>
            )}
          </div>

          {/* Demographics - Horizontal */}
          <div className="flex items-center gap-4 text-xs text-card-foreground">
            {patient.date_of_birth && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">DOB:</span>
                <span>
                  {formatDate(patient.date_of_birth)}
                  {calculateAge(patient.date_of_birth) !== null && (
                    <> ({calculateAge(patient.date_of_birth)})</>
                  )}
                </span>
              </div>
            )}
            {patient.gender && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Gender:</span>
                <span>{patient.gender}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
