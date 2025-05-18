
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
  // Basic user permissions
  'view-profile': ['user', 'operator', 'observer', 'admin', 'superadmin'],
  'manage-profile-settings': ['user', 'operator', 'observer', 'admin', 'superadmin'],
  
  // Live view permissions - all roles
  'view-cameras:assigned': ['user', 'operator', 'observer', 'admin', 'superadmin'],
  
  // Observer and above permissions
  'view-footage:assigned': ['observer', 'operator', 'admin', 'superadmin'],
  'view-dashboard': ['operator', 'admin', 'superadmin'],
  
  // Operator and above permissions
  'manage-cameras:assigned': ['operator', 'admin', 'superadmin'],
  'configure-camera-settings': ['operator', 'admin', 'superadmin'],
  
  // Admin and above permissions
  'view-cameras:all': ['admin', 'superadmin'],
  'view-footage:all': ['admin', 'superadmin'],
  'manage-users:lower': ['admin', 'superadmin'],
  'manage-cameras:all': ['admin', 'superadmin'],
  'configure-storage': ['admin', 'superadmin'],
  'configure-global-policies': ['admin', 'superadmin'],
  'access-logs': ['admin', 'superadmin'],
  'assign-roles': ['admin', 'superadmin'],
  'assign-cameras': ['admin', 'superadmin'],
  
  // Superadmin only permissions
  'manage-users:all': ['superadmin'],
  'manage-system': ['superadmin'],
  'system-migration': ['superadmin']
};

/**
 * Check if the given role has the specified permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return permissionMap[permission]?.includes(role) || false;
}

/**
 * Check if the current user can manage users with the given role
 * Based on role hierarchy
 */
export function canManageRole(currentUserRole: UserRole, targetRole: UserRole): boolean {
  return roleHierarchy[currentUserRole] > roleHierarchy[targetRole];
}
