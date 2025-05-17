
import { UserRole } from "@/contexts/auth/types";

export type Permission = 
  | 'view-profile'
  | 'edit-profile'
  | 'view-admin-panel'
  | 'manage-users:all'
  | 'manage-users:lower'
  | 'assign-roles'
  | 'view-logs'
  | 'view-system-stats'
  | 'view-cameras:all' 
  | 'view-cameras:assigned'
  | 'view-footage:all'
  | 'view-footage:assigned'
  | 'manage-cameras'
  | 'assign-cameras'
  | 'delete-footage'
  | 'access-settings'
  | 'backup-restore'
  // Adding the missing permissions:
  | 'view-dashboard'
  | 'manage-profile-settings'
  | 'configure-camera-settings'
  | 'configure-storage'
  | 'configure-global-policies'
  | 'manage-system'
  | 'access-logs'
  | 'system-migration';

type RolePermissionsMap = {
  [R in UserRole]: Permission[];
};

// Define permissions for each role
const rolePermissions: RolePermissionsMap = {
  superadmin: [
    'view-profile',
    'edit-profile',
    'view-admin-panel',
    'manage-users:all',
    'assign-roles',
    'view-logs',
    'view-system-stats',
    'view-cameras:all',
    'view-footage:all',
    'manage-cameras',
    'assign-cameras',
    'delete-footage',
    'access-settings',
    'backup-restore',
    // Add missing permissions for superadmin
    'view-dashboard',
    'manage-profile-settings',
    'configure-camera-settings',
    'configure-storage',
    'configure-global-policies',
    'manage-system',
    'access-logs',
    'system-migration'
  ],
  admin: [
    'view-profile',
    'edit-profile',
    'view-admin-panel',
    'manage-users:lower',
    'view-logs',
    'view-system-stats',
    'view-cameras:all',
    'view-footage:all',
    'manage-cameras',
    'assign-cameras',
    'delete-footage',
    'access-settings',
    // Add missing permissions for admin
    'view-dashboard',
    'manage-profile-settings',
    'configure-camera-settings',
    'configure-storage',
    'configure-global-policies',
    'manage-system',
    'access-logs',
  ],
  observer: [
    'view-profile',
    'edit-profile',
    'view-cameras:assigned',
    'view-footage:assigned',
    'manage-profile-settings'
  ],
  user: [
    'view-profile',
    'edit-profile',
    'manage-profile-settings'
  ]
};

// Check if a role has a specific permission
export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  // Special handling for observer role to ensure it works
  if (role === 'observer') {
    console.log(`[Permissions] Checking permission ${permission} for observer role`);
    return rolePermissions.observer.includes(permission);
  }
  
  return rolePermissions[role]?.includes(permission) || false;
};

// Check if a user can manage another user based on roles
export const canManageRole = (managerRole: UserRole, targetRole: UserRole): boolean => {
  if (!managerRole || !targetRole) return false;

  // Role hierarchy
  const roleHierarchy: { [key in UserRole]: number } = {
    superadmin: 3,
    admin: 2,
    observer: 1,
    user: 0
  };

  // Return true if manager's role is higher in hierarchy
  return roleHierarchy[managerRole] > roleHierarchy[targetRole];
};
