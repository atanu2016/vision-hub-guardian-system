
export type Permission = 
  | 'view-dashboard'
  | 'view-cameras:all'
  | 'view-cameras:assigned'
  | 'view-footage:all'
  | 'view-footage:assigned'
  | 'manage-users:all'
  | 'manage-users:lower'
  | 'manage-cameras:all'
  | 'manage-cameras:assigned'
  | 'configure-camera-settings'
  | 'configure-storage'
  | 'configure-global-policies'
  | 'view-profile'
  | 'manage-profile-settings'
  | 'manage-system'
  | 'access-logs'
  | 'system-migration'
  | 'assign-roles'
  | 'assign-cameras';

export type UserRole = 'user' | 'observer' | 'superadmin';

// Role hierarchy for permission checking
const roleHierarchy: Record<UserRole, number> = {
  'observer': 0,
  'user': 1,
  'superadmin': 4
};

// Permission mapping - which roles have which permissions
const permissionMap: Record<Permission, UserRole[]> = {
  // Basic user permissions
  'view-profile': ['user', 'observer', 'superadmin'],
  'manage-profile-settings': ['user', 'observer', 'superadmin'],
  
  // Live view permissions - all roles
  'view-cameras:assigned': ['user', 'observer', 'superadmin'],
  
  // Observer and above permissions
  'view-footage:assigned': ['observer', 'user', 'superadmin'],
  'view-dashboard': ['user', 'superadmin'],
  
  // User and above permissions
  'manage-cameras:assigned': ['user', 'superadmin'],
  
  // CRITICAL: Configure camera settings - only superadmin should have this permission
  'configure-camera-settings': ['superadmin'],
  
  // Superadmin permissions
  'view-cameras:all': ['superadmin'],
  'view-footage:all': ['superadmin'],
  'manage-users:lower': ['superadmin'],
  'manage-cameras:all': ['superadmin'],
  'configure-storage': ['superadmin'],
  'configure-global-policies': ['superadmin'],
  'access-logs': ['superadmin'],
  'assign-roles': ['superadmin'],
  'assign-cameras': ['superadmin'],
  'manage-users:all': ['superadmin'],
  'manage-system': ['superadmin'],
  'system-migration': ['superadmin']
};

/**
 * Check if the given role has the specified permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  // Special case for assign-cameras which should only be allowed for superadmin
  if (permission === 'assign-cameras' || permission === 'configure-camera-settings') {
    return role === 'superadmin';
  }
  
  return permissionMap[permission]?.includes(role) || false;
}

/**
 * Check if the current user can manage users with the given role
 * Based on role hierarchy
 */
export function canManageRole(currentUserRole: UserRole, targetRole: UserRole): boolean {
  return roleHierarchy[currentUserRole] > roleHierarchy[targetRole];
}
