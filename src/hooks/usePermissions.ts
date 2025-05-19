
import { useAuth } from "@/contexts/auth";
import { hasPermission, canManageRole } from "@/utils/permissionUtils";
import { UserRole } from "@/contexts/auth/types";
import { Permission } from "@/utils/permissionUtils";
import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';

// This wrapper function helps prevent circular dependencies and React hooks errors
export function usePermissions() {
  const { role: authRole, isAdmin, isSuperAdmin } = useAuth();
  const [permissionCache] = useState<Map<string, boolean>>(new Map());
  
  // Safe permission check that doesn't use other hooks internally
  const checkPermission = async (permission: Permission): Promise<boolean> => {
    const cacheKey = `${authRole}:${permission}`;
    
    // Check cache first for performance
    if (permissionCache.has(cacheKey)) {
      return permissionCache.get(cacheKey) || false;
    }
    
    // Special handling for assign-cameras permission - multiple checks for reliability
    if (permission === 'assign-cameras') {
      // Method 1: Check if super admin via context
      if (isSuperAdmin) {
        permissionCache.set(cacheKey, true);
        return true;
      }
      
      // Method 2: Check if user has admin flag set
      if (isAdmin) {
        permissionCache.set(cacheKey, true);
        return true;
      }
      
      try {
        // Method 3: Check via Supabase RPC function
        const { data: isAdmin, error } = await supabase.rpc('check_if_user_is_admin');
        if (!error && isAdmin === true) {
          permissionCache.set(cacheKey, true);
          return true;
        }
      } catch (err) {
        console.error("Error checking admin status:", err);
      }
      
      // Method 4: Check if user email is special admin email
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email && (
          user.email.toLowerCase() === 'admin@home.local' ||
          user.email.toLowerCase() === 'superadmin@home.local' ||
          user.email.toLowerCase() === 'auth@home.local'
      )) {
        permissionCache.set(cacheKey, true);
        return true;
      }
      
      // If all checks fail, calculate using standard permission function
      const result = hasPermission(authRole, permission);
      permissionCache.set(cacheKey, result);
      return result;
    }
    
    // Standard permission checking for other permissions
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
