
import { Permission } from "@/utils/permissionUtils";
import { UserRole } from "@/types/admin";

/**
 * Hook to handle optimized permission checking for operator and monitoring officer roles
 */
export function useOperatorPermissions(role: UserRole, authRole: UserRole) {
  // Fast path for critical operator permissions to ensure they are never denied
  const isOperatorFastPathEnabled = (permission: Permission) => {
    // These essential permissions should never fail for operator role
    const criticalOperatorPermissions: Permission[] = [
      'view-footage:assigned',
      'view-footage:all',
      'view-cameras:assigned'
    ];

    // If role is operator and permission is critical, always return true
    if ((role === 'operator' || authRole === 'operator') && 
        criticalOperatorPermissions.includes(permission)) {
      console.log(`[PERMS-FAST] ▶️ OPERATOR FAST PATH triggered for ${permission}`);
      return true;
    }

    // These essential permissions should never fail for monitoring officer role
    const criticalMonitoringPermissions: Permission[] = [
      'view-footage:assigned',
      'view-footage:all',
      'view-cameras:assigned',
      'view-profile'
    ];

    // If role is monitoringOfficer and permission is critical, always return true
    if ((role === 'monitoringOfficer' || authRole === 'monitoringOfficer') && 
        criticalMonitoringPermissions.includes(permission)) {
      console.log(`[PERMS-FAST] 👁️ MONITORING OFFICER FAST PATH triggered for ${permission}`);
      return true;
    }

    // Fast path not applicable
    return false;
  };

  return { isOperatorFastPathEnabled };
}
