
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
  const { role, authRole } = useRoleSubscription();
  
  // Define the permissions checking function - memoized for performance
  const hasPermission = useCallback((permission: Permission): boolean => {
    // Create cache key combining role and permission
    const cacheKey = `${role}:${permission}`;
    
    // Check cache first for ultra-fast response
    if (permissionResultCache.has(cacheKey)) {
      return permissionResultCache.get(cacheKey) || false;
    }
    
    // If not in cache, compute the permission
    const result = checkPermission(role, permission);
    
    // Cache the result for future fast lookups
    permissionResultCache.set(cacheKey, result);
    
    return result;
  }, [role]);

  // Fast role management function
  const canManageRoleFunc = useCallback((targetRole: UserRole): boolean => {
    return canManageRole(role, targetRole);
  }, [role]);

  // Return memoized values to prevent unnecessary re-renders
  return useMemo(() => ({
    hasPermission,
    canManageRole: canManageRoleFunc,
    role,
    currentRole: role,
    authRole
  }), [hasPermission, canManageRoleFunc, role, authRole]);
}
