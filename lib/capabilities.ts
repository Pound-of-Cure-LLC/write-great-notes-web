import { useCapabilitiesStore } from '@/store/capabilitiesStore';

/**
 * Hook to access capabilities from Zustand store
 */
export function useCapabilities() {
  const capabilities = useCapabilitiesStore((state) => state.capabilities);
  const hasCapability = useCapabilitiesStore((state) => state.hasCapability);
  const isLoading = useCapabilitiesStore((state) => state.isLoading);
  const adapterType = capabilities?.adapter_type || 'local';

  return {
    capabilities: capabilities?.capabilities || [],
    adapterType,
    isLoading,
    has: hasCapability,
  };
}

/**
 * Capability constants for type safety
 */
export const CAPABILITIES = {
  // Patient Management - READ
  GET_PATIENT: 'get_patient',
  LIST_PATIENTS: 'list_patients',
  SEARCH_PATIENTS: 'search_patients',

  // Patient Management - WRITE
  CREATE_PATIENT: 'create_patient',
  UPDATE_PATIENT: 'update_patient',
  DELETE_PATIENT: 'delete_patient',

  // Patient Management - IMPORT
  IMPORT_PATIENTS_CSV: 'import_patients_csv',

  // Appointment Management - READ
  GET_APPOINTMENT: 'get_appointment',
  LIST_APPOINTMENTS: 'list_appointments',

  // Appointment Management - WRITE
  CREATE_APPOINTMENT: 'create_appointment',
  UPDATE_APPOINTMENT: 'update_appointment',
  DELETE_APPOINTMENT: 'delete_appointment',

  // Appointment Management - IMPORT
  IMPORT_APPOINTMENTS_CSV: 'import_appointments_csv',

  // Note Management
  PUSH_NOTE_TO_EMR: 'push_note_to_emr',
  PUSH_NOTE_TO_EMR_AND_SIGN: 'push_note_to_emr_and_sign',
  SIGN_NOTE: 'sign_note',
  GET_PATIENT_CONTEXT: 'get_patient_context',
} as const;
