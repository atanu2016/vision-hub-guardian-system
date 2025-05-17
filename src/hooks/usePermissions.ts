
import { useAuth } from "@/contexts/auth";
import { Permission, hasPermission, canManageRole } from "@/utils/permissionUtils";
import { UserRole } from "@/types/admin";
import { useEffect } from "react";

export function usePermissions() {
  const { role } = useAuth();
  
  useEffect(() => {
    console.log("usePermissions hook - Current role:", role);
  }, [role]);
  
  const checkPermission = (permission: Permission): boolean => {
    // Force more detailed logging for crucial permissions
    if (permission === 'view-footage:assigned') {
      console.log(`Critical permission check - view-footage:assigned - Role: ${role}`);
      console.log(`Permission check result: ${hasPermission(role, permission)}`);
    }
    
    const result = hasPermission(role, permission);
    console.log(`Permission check for ${permission} with role ${role}: ${result}`);
    return result;
  };
  
  const checkCanManageRole = (targetRole: UserRole): boolean => {
    return canManageRole(role, targetRole);
  };
  
  return {
    hasPermission: checkPermission,
    canManageRole: checkCanManageRole
  };
}
