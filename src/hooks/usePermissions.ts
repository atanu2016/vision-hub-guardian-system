
import { useAuth } from "@/contexts/auth";
import { Permission, hasPermission, canManageRole } from "@/utils/permissionUtils";
import { UserRole } from "@/types/admin";

export function usePermissions() {
  const { role } = useAuth();
  
  const checkPermission = (permission: Permission): boolean => {
    return hasPermission(role, permission);
  };
  
  const checkCanManageRole = (targetRole: UserRole): boolean => {
    return canManageRole(role, targetRole);
  };
  
  return {
    hasPermission: checkPermission,
    canManageRole: checkCanManageRole
  };
}
