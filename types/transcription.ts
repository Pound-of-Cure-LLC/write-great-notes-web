/**
 * Transcription-related type definitions
 */

import { TranscriptionStatus } from "./note";

export interface Transcription {
  id: string;
  organization_id: string;
  appointment_id: string | null;
  external_appointment_id: string | null;
  provider_id: string;
  transcription_text: string;
  provider_notes?: string | null;
  recording_duration_seconds?: number | null;
  visit_type_id?: string | null;
  cancelled_by_user: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  transcription_status?: TranscriptionStatus;
}


