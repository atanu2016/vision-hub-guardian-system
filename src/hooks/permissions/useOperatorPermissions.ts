
import { Permission } from "@/utils/permissionUtils";
import { UserRole } from "@/contexts/auth/types";

/**
 * Hook to handle optimized permission checking for user roles
 */
export function useOperatorPermissions(role: UserRole, authRole: UserRole) {
  // Fast path for critical permissions with optimized checking
  const isOperatorFastPathEnabled = (permission: Permission) => {
    // Critical permissions per role
    const criticalPermissionMap: Record<UserRole, Permission[]> = {
      'user': [
        'view-profile'
      ],
      'observer': [
        'view-profile',
        'view-footage:assigned'
      ],
      'admin': [],
      'superadmin': [],
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
