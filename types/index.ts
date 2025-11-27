/**
 * Central export point for all type definitions
 *
 * Usage: import { User, Patient, Appointment } from '@/types'
 */

export type { User, UserRole, UserListItem } from './user';
export type { Patient, PatientListItem } from './patient';
export type {
  Appointment,
  AppointmentStatusRecord,
  AppointmentViewModel
} from './appointment';
export type { TranscriptionStatus, StatusData } from '@/contexts/TranscriptionStatusContext';
export type {
  Note,
  NoteSection,
  Diagnosis,
  NoteSectionConfig
} from './note';
export type { VisitType, VisitTypeListItem } from './visit-type';
export type {
  EMRSettings,
  EMRConnection,
  EMRType,
  CharmSettings
} from './emr';
export type {
  Vital,
  VitalMetric,
  VitalDefinition,
  VitalEntry,
  VitalsResponse,
  VitalDefinitionsResponse
} from './vitals';
export type {
  OrganizationProvider,
  NPIProvider,
  ProviderSearchResult,
  SelectedProvider,
  ProviderAssociation,
  PatientProviderLink,
  ProvidersResponse,
  PatientProvidersResponse
} from './providers';
