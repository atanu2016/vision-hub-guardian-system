
import { Permission } from "@/utils/permissionUtils";
import { UserRole } from "@/contexts/auth/types";

/**
 * Hook to handle optimized permission checking for user roles
 */
export function useOperatorPermissions(role: UserRole, authRole: UserRole) {
  // Fast path for critical permissions with optimized checking
  const isOperatorFastPathEnabled = (permission: Permission) => {
    // Log to verify role values
    console.log(`[Operator Permissions] Checking fast path for permission: ${permission}, role: ${role}, authRole: ${authRole}`);

    // Critical permissions per role
    const criticalPermissionMap: Record<UserRole, Permission[]> = {
      'user': [
        'view-profile'
      ],
      'observer': [
        'view-profile',
        'view-footage:assigned'
      ],
      'superadmin': []
    };

    // Check if this permission is critical for the current role
    if (role in criticalPermissionMap && 
        criticalPermissionMap[role].includes(permission)) {
      console.log(`[Operator Permissions] Fast path enabled for role: ${role}, permission: ${permission}`);
      return true;
    }
    
    // Check auth role as fallback
    if (authRole in criticalPermissionMap && 
        criticalPermissionMap[authRole].includes(permission)) {
      console.log(`[Operator Permissions] Fast path enabled for authRole: ${authRole}, permission: ${permission}`);
      return true;
    }

    console.log(`[Operator Permissions] Fast path not enabled for permission: ${permission}`);
    return false;
  };

  return { isOperatorFastPathEnabled };
}
