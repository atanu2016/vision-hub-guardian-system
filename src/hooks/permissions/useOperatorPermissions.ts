
import { Permission } from "@/utils/permissionUtils";
import { UserRole } from "@/types/admin";

export function useOperatorPermissions(role: UserRole, authRole: UserRole) {
  // Critical permissions that always get fast-pathed for operators
  const criticalOperatorPermissions: Permission[] = [
    'view-footage:assigned',
    'view-cameras:assigned',
    'view-footage:all',
    'manage-cameras:assigned'
  ];
  
  // Fast path permission check for operator role
  const isOperatorFastPathEnabled = (permission: Permission): boolean => {
    if (role !== 'operator') return false;
    
    if (criticalOperatorPermissions.includes(permission)) {
      console.log(`[PERMISSIONS] ▶️ OPERATOR FAST PATH: Granting '${permission}'`);
      return true;
    }
    
    // Also check local storage as a backup confirmation
    if (localStorage.getItem('operator_role_confirmed') === 'true') {
      if (criticalOperatorPermissions.includes(permission)) {
        console.log(`[PERMISSIONS] ▶️ OPERATOR BACKUP CONFIRMATION: Granting '${permission}'`);
        return true;
      }
    }
    
    return false;
  };
  
  return { isOperatorFastPathEnabled };
}
