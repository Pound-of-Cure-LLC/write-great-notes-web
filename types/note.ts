/**
 * Clinical note-related type definitions
 */

export interface TranscriptionStatus {
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
  created_at?: string | null;
}

export interface Note {
  id: string;
  organization_id: string;
  appointment_id: string;
  transcription_id: string;
  visit_type_id: string;
  emr_note_id?: string;
  is_signed: boolean;
  signed_by?: string;
  signed_at?: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  // Optional nested data
  diagnoses?: Diagnosis[];
  sections?: NoteSection[];
  transcription_status?: TranscriptionStatus;
}

export interface NoteSection {
  id: string;
  note_id: string;
  organization_id: string;
  section_name: string;
  original_section_name?: string;
  section_order: number;
  content: string;
  edited_content?: string;
  note_section_type_id?: string;
  section_type_slug?: string;
  section_type_display_name?: string;
  brief_summary?: string;
  created_at: string;
  updated_at: string;
}

export interface Diagnosis {
  code: string;
  description: string;
  icd_version?: string;
}

export interface NoteSectionConfig {
  id: string;
  organization_id?: string;
  visit_type_id: string;
  section_name: string;
  section_order: number;
  is_required: boolean;
  is_active: boolean;
  note_section_type_id: string;
  section_type_slug?: string;
  section_type_display_name?: string;
  brief_summary?: string;
  // ai_instructions and ai_example excluded from API responses for security
  // They're only used internally by the backend during note generation
}
