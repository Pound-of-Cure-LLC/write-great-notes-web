/**
 * User-related type definitions
 */

export interface User {
  id: string;
  email: string;
  uid: string;
  organization_id: string;
  roles: UserRole[];
  first_name?: string;
  last_name?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export type UserRole = 'provider' | 'admin' | 'super_admin' | 'staff';

export interface UserListItem {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  roles: UserRole[];
  created_at: string;
}
