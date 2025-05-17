
import { Permission } from "@/utils/permissionUtils";
import { UserRole } from "@/contexts/auth/types";

/**
 * Hook to handle optimized permission checking for operator and monitoring officer roles
 */
export function useOperatorPermissions(role: UserRole, authRole: UserRole) {
  // Fast path for critical operator permissions with optimized checking
  const isOperatorFastPathEnabled = (permission: Permission) => {
    // Critical permissions per role
    const criticalPermissionMap: Record<UserRole, Permission[]> = {
      'operator': [
        'view-footage:assigned',
        'view-footage:all',
        'view-cameras:assigned'
      ],
      'monitoringOfficer': [
        'view-footage:assigned',
        'view-footage:all',
        'view-cameras:assigned',
        'view-profile'
      ],
      'admin': [],
      'superadmin': [],
      'user': []
    };

    // Check if this permission is critical for the current role
    if ((role in criticalPermissionMap) && 
        criticalPermissionMap[role].includes(permission)) {
      return true;
    }
    
    // Check auth role as fallback
    if ((authRole in criticalPermissionMap) && 
        criticalPermissionMap[authRole].includes(permission)) {
      return true;
    }

    return false;
  };

  return { isOperatorFastPathEnabled };
}
