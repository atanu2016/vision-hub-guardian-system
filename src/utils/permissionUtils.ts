
import { UserRole } from "@/types/admin";

export const roleHierarchy: Record<UserRole, number> = {
  'user': 0,
  'operator': 1,
  'admin': 2,
  'superadmin': 3
};

export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  switch (permission) {
    case 'view-cameras:assigned':
    case 'view-footage:assigned':
      return roleHierarchy[userRole] >= roleHierarchy['user'];
    case 'manage-users:lower':
      return roleHierarchy[userRole] >= roleHierarchy['admin'];
    case 'manage-users:all':
    case 'assign-roles':
      return userRole === 'superadmin';
    case 'configure-storage':
    case 'configure-camera-settings':
    case 'configure-global-policies':
    case 'manage-system':
    case 'access-logs':
      return roleHierarchy[userRole] >= roleHierarchy['admin'];
    default:
      return false;
  }
}

export function canManageRole(currentUserRole: UserRole, targetRole: UserRole): boolean {
  // Superadmins can manage all roles
  if (currentUserRole === 'superadmin') {
    return true;
  }

  // Admins can manage operators and users
  if (currentUserRole === 'admin' && (targetRole === 'operator' || targetRole === 'user')) {
    return true;
  }

  return false;
}

export type Permission = 
  | 'view-cameras:assigned' 
  | 'view-footage:assigned'
  | 'manage-users:all'
  | 'manage-users:lower'
  | 'assign-roles'
  | 'configure-storage'
  | 'configure-camera-settings'
  | 'configure-global-policies'
  | 'manage-system'
  | 'access-logs';
