/**
 * Shared type definition for Past Notes feature
 * Used across multiple pages (appointments/transcribe, patients/[id])
 */
export interface PastNote {
  id: string;
  brief_summary?: string;
  note_text?: string;
  note_text_html?: string;
  is_signed?: boolean;
  signed_at?: string;
  created_at?: string;
  appointment_datetime?: string;
  visit_type?: string;
  appointment_id?: string;
  has_local_version?: boolean;
  provider_name?: string | null;
  emr_settings?: {
    emr_note_id?: string;
    appointment_datetime?: string;
  };
  transcriptions?: {
    id: string;
    appointment_id?: string;
    external_appointment_id?: string;
    appointments?: {
      id: string;
      appointment_datetime: string;
      visit_types?: {
        name: string;
      };
    };
  };
}
