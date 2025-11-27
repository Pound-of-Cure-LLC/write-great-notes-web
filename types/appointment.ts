/**
 * Appointment-related type definitions
 */

import type { TranscriptionStatus } from "./note";
import { Patient } from "./patient";
import { VisitType } from "./visit-type";

export interface Appointment {
  id: string;
  organization_id: string;
  patient_id: string;
  provider_id: string;
  visit_type_id: string;
  location_id?: string;
  appointment_datetime: string;
  duration_minutes?: number;
  status: string; // Appointment status (e.g., "scheduled")
  emr_appointment_id?: string;
  is_telemed?: boolean;
  created_at?: string;
  updated_at?: string;
  // Nested relations
  patients?: Patient;
  visit_types?: VisitType;
  providers?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  transcription_status?: TranscriptionStatus;
}

export interface AppointmentStatusRecord {
  id: string;
  appointment_id: string;
  organization_id: string;
  status: string;
  transcription_id?: string;
  note_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentViewModel extends Appointment {
  patient_name: string;
  visit_type_name?: string;
  provider_name?: string;
  current_status?: string;
}
