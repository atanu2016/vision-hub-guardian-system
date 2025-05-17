import { UserRole } from '@/types/admin';

export type Permission = 
  // User management permissions
  | 'manage-users:all'       // Can manage all users including admins
  | 'manage-users:lower'     // Can manage operators and users only
  | 'assign-roles'           // Can assign/change user roles
  
  // Camera permissions
  | 'manage-cameras:all'     // Full camera management
  | 'view-cameras:assigned'  // View cameras that are assigned to the user
  | 'view-footage:all'       // View all footage
  | 'view-footage:assigned'  // View footage from assigned cameras
  | 'download-footage:all'   // Download any footage
  | 'download-footage:assigned' // Download footage from assigned cameras
  
  // Configuration permissions
  | 'configure-storage'      // Can configure storage settings
  | 'configure-global-policies' // Can set global policies
  | 'configure-camera-settings' // Can configure camera settings
  
  // System permissions
  | 'access-logs'            // Can access system logs
  | 'manage-system'          // Can manage system settings
  | 'view-analytics'         // Can view system analytics
  | 'manage-alerts:all'      // Can manage all alerts
  | 'manage-alerts:own'      // Can manage own alerts
  | 'access-diagnostics:all' // Can access all diagnostics
  | 'access-diagnostics:assigned'; // Can access diagnostics for assigned devices

// Permission mapping by role
const rolePermissions: Record<UserRole, Permission[]> = {
  superadmin: [
    'manage-users:all',
    'assign-roles',
    'manage-cameras:all',
    'view-cameras:assigned',
    'view-footage:all',
    'download-footage:all',
    'configure-storage',
    'configure-global-policies',
    'configure-camera-settings',
    'access-logs',
    'manage-system',
    'view-analytics',
    'manage-alerts:all',
    'access-diagnostics:all'
  ],
  admin: [
    'manage-users:lower',
    'manage-cameras:all',
    'view-cameras:assigned',
    'view-footage:all',
    'download-footage:all',
    'configure-camera-settings',
    'view-analytics',
    'manage-alerts:all',
    'access-diagnostics:all'
  ],
  operator: [
    'view-cameras:assigned',
    'view-footage:assigned',
    'download-footage:assigned',
    'manage-alerts:own',
    'access-diagnostics:assigned'
  ],
  user: [
    'view-cameras:assigned',
    'view-footage:assigned',
    'download-footage:assigned'
  ]
};

/**
 * Checks if a user with a specific role has a permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) || false;
}

/**
 * Checks if a user with a specific role can manage another user with a specific role
 */
export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  // Superadmins can manage everyone
  if (managerRole === 'superadmin') return true;
  
  // Admins can manage operators and users, but not superadmins or other admins
  if (managerRole === 'admin') {
    return targetRole === 'operator' || targetRole === 'user';
  }
  
  // Other roles cannot manage users
  return false;
}
