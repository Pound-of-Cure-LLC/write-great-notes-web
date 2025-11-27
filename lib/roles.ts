/**
 * Role-based authorization helpers
 */

export type UserRole = 'super-admin' | 'admin' | 'provider' | 'staff'

export const isAdmin = (roles: string[]): boolean => {
  return roles.includes('admin') || roles.includes('super-admin')
}

export const isProvider = (roles: string[]): boolean => {
  return roles.includes('provider')
}

export const isProviderOrAdmin = (roles: string[]): boolean => {
  return isProvider(roles) || isAdmin(roles)
}

export const isStaff = (roles: string[]): boolean => {
  return roles.includes('staff')
}

export const isSuperAdmin = (roles: string[]): boolean => {
  return roles.includes('super-admin')
}
