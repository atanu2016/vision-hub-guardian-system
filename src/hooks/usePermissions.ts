
import { useAuth } from "@/contexts/auth";
import { Permission, hasPermission, canManageRole } from "@/utils/permissionUtils";
import { UserRole } from "@/types/admin";
import { useEffect, useCallback } from "react";

export function usePermissions() {
  const { role } = useAuth();
  
  useEffect(() => {
    console.log("[PERMISSIONS] usePermissions hook initialized - Current role:", role);
  }, [role]);
  
  const checkPermission = useCallback((permission: Permission): boolean => {
    // Force more detailed logging for crucial permissions
    if (permission === 'view-footage:assigned' || permission === 'view-cameras:assigned') {
      console.log(`[PERMISSIONS] Critical permission check: ${permission} - Role: ${role}`);
      
      // Direct logic check for operators
      if (role === 'operator') {
        console.log(`[PERMISSIONS] Operator role detected - should have ${permission} permission`);
        return true;
      }
      
      // For other roles, go through normal permission check
      const result = hasPermission(role, permission);
      console.log(`[PERMISSIONS] Permission check result: ${result}`);
      return result;
    }
    
    const result = hasPermission(role, permission);
    console.log(`[PERMISSIONS] Permission check for ${permission} with role ${role}: ${result}`);
    return result;
  }, [role]);
  
  const checkCanManageRole = useCallback((targetRole: UserRole): boolean => {
    return canManageRole(role, targetRole);
  }, [role]);
  
  return {
    hasPermission: checkPermission,
    canManageRole: checkCanManageRole
  };
}
