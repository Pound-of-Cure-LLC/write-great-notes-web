/**
 * Visit type-related type definitions
 */

export interface VisitType {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  emr_visit_type_id?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VisitTypeListItem {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
}
