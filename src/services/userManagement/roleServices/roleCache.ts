
/**
 * Provides role caching functionality to improve performance
 */

import type { UserRole } from '@/contexts/auth/types';

// Cache for role information to reduce database queries
const roleCache = new Map<string, { role: UserRole, timestamp: number }>();
const CACHE_TIMEOUT = 15000; // 15 seconds cache - reduced from 30 seconds

/**
 * Get a cached role if it exists and is not expired
 */
export function getCachedRole(userId: string): UserRole | null {
  const cachedRole = roleCache.get(userId);
  
  if (cachedRole && (Date.now() - cachedRole.timestamp < CACHE_TIMEOUT)) {
    console.log(`[Role Cache] Using cached role: ${cachedRole.role} for user ${userId}`);
    return cachedRole.role;
  }
  
  // Also check local storage as backup cache
  try {
    const lsRole = localStorage.getItem(`user_role_${userId}`);
    const lsTime = localStorage.getItem(`user_role_time_${userId}`);
    
    if (lsRole && lsTime && (Date.now() - parseInt(lsTime, 10) < CACHE_TIMEOUT)) {
      console.log(`[Role Cache] Using localStorage cached role: ${lsRole} for user ${userId}`);
      setCachedRole(userId, lsRole as UserRole);
      return lsRole as UserRole;
    }
  } catch (e) {
    // Ignore localStorage errors
    console.warn('[Role Cache] Error accessing localStorage:', e);
  }
  
  return null;
}

/**
 * Store a role in the cache with current timestamp
 */
export function setCachedRole(userId: string, role: UserRole): void {
  console.log(`[Role Cache] Caching role: ${role} for user ${userId}`);
  roleCache.set(userId, { 
    role, 
    timestamp: Date.now() 
  });
  
  // Also cache in localStorage as backup
  try {
    localStorage.setItem(`user_role_${userId}`, role);
    localStorage.setItem(`user_role_time_${userId}`, Date.now().toString());
  } catch (e) {
    // Ignore localStorage errors
    console.warn('[Role Cache] Error setting localStorage cache:', e);
  }
}

/**
 * Invalidate the role cache for a specific user or completely
 */
export function invalidateRoleCache(userId?: string): void {
  if (userId) {
    console.log(`[Role Cache] Invalidating cache for user ${userId}`);
    roleCache.delete(userId);
    
    // Also clear localStorage cache
    try {
      localStorage.removeItem(`user_role_${userId}`);
      localStorage.removeItem(`user_role_time_${userId}`);
    } catch (e) {
      // Ignore localStorage errors
    }
  } else {
    console.log(`[Role Cache] Invalidating entire role cache`);
    roleCache.clear();
    
    // Clear all role-related items from localStorage
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('user_role_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      // Ignore localStorage errors
    }
  }
}
