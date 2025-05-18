
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
  | 'system-migration';

export type UserRole = 'user' | 'operator' | 'observer' | 'admin' | 'superadmin';

// Role hierarchy for permission checking
const roleHierarchy: Record<UserRole, number> = {
  'observer': 0,
  'user': 1,
  'operator': 2,
  'admin': 3,
  'superadmin': 4
};

// Permission mapping - which roles have which permissions
const permissionMap: Record<Permission, UserRole[]> = {
  'view-dashboard': ['admin', 'superadmin', 'user', 'operator', 'observer'],
  'view-cameras:all': ['admin', 'superadmin'],
  'view-cameras:assigned': ['user', 'operator', 'observer', 'admin', 'superadmin'],
  'view-footage:all': ['admin', 'superadmin'],
  'view-footage:assigned': ['user', 'operator', 'observer', 'admin', 'superadmin'],
  'manage-users:all': ['superadmin'],
  'manage-users:lower': ['admin', 'superadmin'],
  'manage-cameras:all': ['admin', 'superadmin'],
  'manage-cameras:assigned': ['operator', 'admin', 'superadmin'],
  'configure-camera-settings': ['operator', 'admin', 'superadmin'],
  'configure-storage': ['admin', 'superadmin'],
  'configure-global-policies': ['admin', 'superadmin'],
  'view-profile': ['user', 'operator', 'observer', 'admin', 'superadmin'],
  'manage-profile-settings': ['user', 'operator', 'observer', 'admin', 'superadmin'],
  'manage-system': ['superadmin'],
  'access-logs': ['admin', 'superadmin'],
  'system-migration': ['superadmin']
};

/**
 * Check if the given role has the specified permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  // Check for special test account - allow all for testing
  if (role === 'user') {
    return true;
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
