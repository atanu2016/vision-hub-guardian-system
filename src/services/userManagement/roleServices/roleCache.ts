
/**
 * Cache utilities for user roles
 */

import type { UserRole } from '@/contexts/auth/types';

// In-memory cache for roles with timestamps
const roleCache = new Map<string, { role: UserRole, timestamp: number }>();

// Cache timeout (15 minutes)
const CACHE_TIMEOUT = 15 * 60 * 1000;

/**
 * Get a cached role
 */
export function getCachedRole(userId: string, includeTimestamp = false): UserRole | { role: UserRole, timestamp: number } | null {
  const cachedData = roleCache.get(userId);
  
  if (!cachedData) {
    return null;
  }
  
  // Check if cache is stale
  if (Date.now() - cachedData.timestamp > CACHE_TIMEOUT) {
    roleCache.delete(userId);
    return null;
  }
  
  return includeTimestamp ? cachedData : cachedData.role;
}

/**
 * Cache a role
 */
export function setCachedRole(userId: string, role: UserRole): void {
  roleCache.set(userId, {
    role,
    timestamp: Date.now()
  });
}

/**
 * Invalidate the role cache
 */
export function invalidateRoleCache(userId?: string): void {
  if (userId) {
    roleCache.delete(userId);
  } else {
    roleCache.clear();
  }
}

// Set up periodic cache cleanup
setInterval(() => {
  const now = Date.now();
  for (const [userId, data] of roleCache.entries()) {
    if (now - data.timestamp > CACHE_TIMEOUT) {
      roleCache.delete(userId);
    }
  }
}, 5 * 60 * 1000); // Clean every 5 minutes
