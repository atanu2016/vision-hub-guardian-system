
import { useMemo, useCallback } from 'react';
import { hasPermission as checkPermission, canManageRole } from '@/utils/permissionUtils';
import { useRoleSubscription } from './useRoleSubscription';
import type { Permission } from '@/utils/permissionUtils';
import type { UsePermissionsReturn } from './types';
import type { UserRole } from '@/contexts/auth/types';
import { supabase } from '@/integrations/supabase/client';

// Permission check result cache
const permissionResultCache = new Map<string, boolean>();

/**
 * Optimized core hook for checking permissions with improved performance
 * Now using the new is_superadmin_check function that avoids RLS recursion
 */
export function usePermissionsCore(): UsePermissionsReturn {
  // Get current user role from optimized subscription
  const { role, authRole, error, isLoading } = useRoleSubscription();
  
  // Define the permissions checking function - memoized for performance
  const hasPermission = useCallback(async (permission: Permission): Promise<boolean> => {
    // Special case for critical permissions - always check admin status using the new function
    if (permission === 'assign-cameras' || permission === 'assign-roles' || 
        permission === 'manage-system' || permission === 'system-migration' || 
        permission === 'configure-camera-settings') {
      try {
        // Check using our new RPC function that bypasses RLS
        const { data: isSuperAdmin, error: superAdminError } = await supabase
          .rpc('is_superadmin_check');
          
        if (!superAdminError && isSuperAdmin === true) {
          return true;
        }
        
        // Fallback check for special emails
        const sessionResponse = await supabase.auth.getSession();
        const userEmail = sessionResponse.data?.session?.user?.email;
        
        if (userEmail) {
          const lowerEmail = userEmail.toLowerCase();
          if (lowerEmail === 'admin@home.local' || lowerEmail === 'superadmin@home.local') {
            return true;
          }
        }
      } catch (err) {
        console.error("Error checking admin permissions:", err);
      }
    }
    
    // If there's an error with role subscription, use a more permissive approach
    if (error) {
      console.warn(`[PERMISSIONS] Error in role subscription, using permissive check for ${permission}`);
      return true; // Allow access when we can't determine roles due to DB errors
    }
    
    // Create cache key combining role and permission
    const cacheKey = `${role}:${permission}`;
    
    // Check cache first for ultra-fast response
    if (permissionResultCache.has(cacheKey)) {
      return permissionResultCache.get(cacheKey) || false;
    }
    
    // If not in cache, compute the permission
    // Ensure role is cast to UserRole
    const result = checkPermission(role as UserRole, permission);
    
    // Cache the result for future fast lookups
    permissionResultCache.set(cacheKey, result);
    
    return result;
  }, [role, error]);
  
  // Fast role management function
  const canManageRoleFunc = useCallback((targetRole: UserRole): boolean => {
    return canManageRole(role as UserRole, targetRole);
  }, [role]);
  
  // Synchronous version of hasPermission for compatibility
  const hasPermissionSync = useCallback((permission: Permission): boolean => {
    // If there's an error with role subscription, use a more permissive approach
    if (error) {
      console.warn(`[PERMISSIONS] Error in role subscription, using permissive check for ${permission}`);
      return true; // Allow access when we can't determine roles due to DB errors
    }
    
    // For superadmin, grant permission - quick check
    if (role === 'superadmin') {
      return true;
    }

    // Special emails that always have admin privileges
    try {
      const sessionData = supabase.auth.getUser();
      if (sessionData && typeof sessionData.then === 'function') {
        // This is a Promise, we can't use it synchronously
        // We'll need to handle this differently
        console.warn("[PERMISSIONS] Cannot check user email synchronously");
      }
    } catch (err) {
      console.error("[PERMISSIONS] Error checking user email:", err);
    }
    
    // Create cache key combining role and permission
    const cacheKey = `${role}:${permission}`;
    
    // Check cache first for ultra-fast response
    if (permissionResultCache.has(cacheKey)) {
      return permissionResultCache.get(cacheKey) || false;
    }
    
    // If not in cache, compute the permission
    // Ensure role is cast to UserRole
    const result = checkPermission(role as UserRole, permission);
    
    // Cache the result for future fast lookups
    permissionResultCache.set(cacheKey, result);
    
    return result;
  }, [role, error]);
  
  // Return memoized values to prevent unnecessary re-renders
  return useMemo(() => ({
    hasPermission: hasPermissionSync,
    canManageRole: canManageRoleFunc,
    role: role as UserRole,
    currentRole: role as UserRole,
    authRole: authRole as UserRole,
    isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null
  }), [hasPermissionSync, canManageRoleFunc, role, authRole, error, isLoading]);
}
