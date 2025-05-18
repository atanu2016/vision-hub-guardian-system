
import { useMemo, useCallback } from 'react';
import { hasPermission as checkPermission, canManageRole } from '@/utils/permissionUtils';
import { useRoleSubscription } from './useRoleSubscription';
import type { Permission } from '@/utils/permissionUtils';
import type { UsePermissionsReturn } from './types';
import type { UserRole } from '@/contexts/auth/types';

// Permission check result cache
const permissionResultCache = new Map<string, boolean>();

/**
 * Optimized core hook for checking permissions with improved performance
 */
export function usePermissionsCore(): UsePermissionsReturn {
  // Get current user role from optimized subscription
  const { role, authRole, error } = useRoleSubscription();
  
  // Define the permissions checking function - memoized for performance
  const hasPermission = useCallback((permission: Permission): boolean => {
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

  // Return memoized values to prevent unnecessary re-renders
  return useMemo(() => ({
    hasPermission,
    canManageRole: canManageRoleFunc,
    role: role as UserRole,
    currentRole: role as UserRole,
    authRole: authRole as UserRole,
    error
  }), [hasPermission, canManageRoleFunc, role, authRole, error]);
}
