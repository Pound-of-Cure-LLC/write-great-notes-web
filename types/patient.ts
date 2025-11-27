/**
 * Patient-related type definitions
 */

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  mrn?: string;
  email?: string;
  phone?: string;
  organization_id: string;
  emr_patient_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PatientListItem {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  mrn?: string;
  email?: string;
  phone?: string;
}
