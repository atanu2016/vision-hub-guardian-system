
/**
 * Provides role caching functionality to improve performance
 */

import type { UserRole } from '@/types/admin';

// Cache for role information to reduce database queries
const roleCache = new Map<string, { role: UserRole, timestamp: number }>();
const CACHE_TIMEOUT = 30000; // 30 seconds cache

/**
 * Get a cached role if it exists and is not expired
 */
export function getCachedRole(userId: string): UserRole | null {
  const cachedRole = roleCache.get(userId);
  
  if (cachedRole && (Date.now() - cachedRole.timestamp < CACHE_TIMEOUT)) {
    console.log(`[Role Cache] Using cached role: ${cachedRole.role} for user ${userId}`);
    return cachedRole.role;
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
}

/**
 * Invalidate the role cache for a specific user or completely
 */
export function invalidateRoleCache(userId?: string): void {
  if (userId) {
    console.log(`[Role Cache] Invalidating cache for user ${userId}`);
    roleCache.delete(userId);
  } else {
    console.log(`[Role Cache] Invalidating entire role cache`);
    roleCache.clear();
  }
}
