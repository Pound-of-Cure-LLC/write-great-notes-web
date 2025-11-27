/**
 * EMR (Electronic Medical Record) related type definitions
 */

export interface EMRSettings {
  emr_type?: string;
  emr_connection_id?: string;
  has_emr_integration: boolean;
  can_push_to_emr: boolean;
}

export interface EMRConnection {
  id: string;
  organization_id: string;
  emr_type: EMRType;
  connection_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type EMRType = 'charm' | 'epic' | 'athena' | 'local_database' | 'custom';

export interface CharmSettings {
  base_url: string;
  client_id?: string;
  // Note: Never expose client_secret or refresh_token in frontend types
}
