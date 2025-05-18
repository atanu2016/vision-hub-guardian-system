
import { useAuth } from "@/contexts/auth";
import { hasPermission, canManageRole } from "@/utils/permissionUtils";
import { UserRole } from "@/contexts/auth/types";
import { Permission } from "@/utils/permissionUtils";
import { useState, useEffect } from "react";

// This wrapper function helps prevent circular dependencies and React hooks errors
export function usePermissions() {
  const { role: authRole } = useAuth();
  const [permissionCache] = useState<Map<string, boolean>>(new Map());
  
  // Safe permission check that doesn't use other hooks internally
  const checkPermission = (permission: Permission): boolean => {
    const cacheKey = `${authRole}:${permission}`;
    
    // Check cache first for performance
    if (permissionCache.has(cacheKey)) {
      return permissionCache.get(cacheKey) || false;
    }
    
    // Calculate permission using util function
    const result = hasPermission(authRole, permission);
    permissionCache.set(cacheKey, result);
    return result;
  };
  
  // Check if current user can manage the specified role
  const checkManageRole = (role: UserRole): boolean => {
    return canManageRole(authRole, role);
  };
  
  return {
    hasPermission: checkPermission,
    canManageRole: checkManageRole,
    role: authRole,
    currentRole: authRole,
    authRole,
    isLoading: false
  };
}

export type { UsePermissionsReturn } from "./permissions/types";
export { canManageRole } from "@/utils/permissionUtils";
