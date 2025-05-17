
import { useCallback, useEffect } from "react";
import { Permission, hasPermission, canManageRole } from "@/utils/permissionUtils";
import { UserRole } from "@/types/admin";
import { usePermissionCache } from "./usePermissionCache";
import { useRoleSubscription } from "./useRoleSubscription";
import { useOperatorPermissions } from "./useOperatorPermissions";
import { UsePermissionsReturn } from "./types";

export function usePermissionsCore(): UsePermissionsReturn {
  const { role, authRole } = useRoleSubscription();
  const { getCachedPermission, setCachedPermission, clearCache } = usePermissionCache();
  const { isOperatorFastPathEnabled } = useOperatorPermissions(role, authRole);
  
  // Performance-optimized permission check with caching
  const checkPermission = useCallback((permission: Permission): boolean => {
    // Critical fast path for key user permissions
    if (isOperatorFastPathEnabled(permission)) {
      return true;
    }
    
    const cacheKey = `${role}:${permission}`;
    const cachedValue = getCachedPermission(cacheKey);
    
    if (cachedValue !== null) {
      return cachedValue;
    }
    
    // Force more detailed logging for crucial permissions
    const criticalPermissions: Permission[] = [
      'view-footage:assigned',
      'view-cameras:assigned',
      'view-footage:all'
    ];
    
    if (criticalPermissions.includes(permission)) {
      console.log(`[PERMISSIONS] Critical permission check: ${permission} - Role: ${role}`);
      
      // Special handling for admin users with these critical permissions
      if (role === 'admin' || role === 'superadmin') {
        console.log(`[PERMISSIONS] ▶️ Admin permission check - granting ${permission}`);
        // Cache the result
        setCachedPermission(cacheKey, true);
        return true;
      }
    }
    
    const result = hasPermission(role, permission);
    console.log(`[PERMISSIONS] Permission check: ${permission} for ${role} = ${result}`);
    
    // Cache the result
    setCachedPermission(cacheKey, result);
    
    return result;
  }, [role, authRole, getCachedPermission, setCachedPermission, isOperatorFastPathEnabled]);
  
  // Standard role management function
  const checkCanManageRole = useCallback((targetRole: UserRole): boolean => {
    return canManageRole(role, targetRole);
  }, [role]);
  
  // Clear cache when component unmounts or dependencies change
  useEffect(() => {
    return () => {
      clearCache();
    };
  }, [role, clearCache]);
  
  return {
    hasPermission: checkPermission,
    canManageRole: checkCanManageRole,
    currentRole: role
  };
}
