
/**
 * Optimized role caching functionality
 */
import type { UserRole } from '@/contexts/auth/types';

// Low-latency in-memory cache
const roleCache = new Map<string, { role: UserRole, timestamp: number }>();
const CACHE_TIMEOUT = 10000; // 10 second cache - optimized for better performance

// Separate cache for frequently accessed roles to avoid localStorage overhead
const frequentAccessCache = new Map<string, { role: UserRole, timestamp: number }>();

/**
 * Get a cached role with improved performance
 */
export function getCachedRole(userId: string): UserRole | null {
  // First check frequent access cache (RAM only, super fast)
  const frequentCachedRole = frequentAccessCache.get(userId);
  
  if (frequentCachedRole && (Date.now() - frequentCachedRole.timestamp < CACHE_TIMEOUT)) {
    return frequentCachedRole.role;
  }
  
  // Then check regular cache
  const cachedRole = roleCache.get(userId);
  
  if (cachedRole && (Date.now() - cachedRole.timestamp < CACHE_TIMEOUT)) {
    // Update frequent access cache
    frequentAccessCache.set(userId, cachedRole);
    return cachedRole.role;
  }
  
  // As last resort, check local storage (but only if absolutely needed)
  try {
    const lsRole = localStorage.getItem(`user_role_${userId}`);
    const lsTime = localStorage.getItem(`user_role_time_${userId}`);
    
    if (lsRole && lsTime && (Date.now() - parseInt(lsTime, 10) < CACHE_TIMEOUT)) {
      const role = lsRole as UserRole;
      setCachedRole(userId, role);
      return role;
    }
  } catch (e) {
    // Ignore localStorage errors
  }
  
  return null;
}

/**
 * Store a role in the cache with performance optimizations
 */
export function setCachedRole(userId: string, role: UserRole): void {
  const cacheEntry = { 
    role, 
    timestamp: Date.now() 
  };
  
  // Update both caches
  roleCache.set(userId, cacheEntry);
  frequentAccessCache.set(userId, cacheEntry);
  
  // Update localStorage asynchronously to prevent UI blocking
  setTimeout(() => {
    try {
      localStorage.setItem(`user_role_${userId}`, role);
      localStorage.setItem(`user_role_time_${userId}`, Date.now().toString());
    } catch (e) {
      // Ignore localStorage errors
    }
  }, 0);
}

/**
 * Invalidate the role cache efficiently
 */
export function invalidateRoleCache(userId?: string): void {
  if (userId) {
    roleCache.delete(userId);
    frequentAccessCache.delete(userId);
    
    // Clean localStorage asynchronously
    setTimeout(() => {
      try {
        localStorage.removeItem(`user_role_${userId}`);
        localStorage.removeItem(`user_role_time_${userId}`);
      } catch (e) {
        // Ignore localStorage errors
      }
    }, 0);
  } else {
    roleCache.clear();
    frequentAccessCache.clear();
    
    // Clean localStorage asynchronously
    setTimeout(() => {
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('user_role_')) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        // Ignore localStorage errors
      }
    }, 0);
  }
}

// Add memory management function to prevent memory leaks
export function cleanupRoleCache(): void {
  const now = Date.now();
  
  // Clean up expired entries from both caches
  for (const [userId, entry] of roleCache.entries()) {
    if (now - entry.timestamp > CACHE_TIMEOUT * 3) {
      roleCache.delete(userId);
    }
  }
  
  for (const [userId, entry] of frequentAccessCache.entries()) {
    if (now - entry.timestamp > CACHE_TIMEOUT * 3) {
      frequentAccessCache.delete(userId);
    }
  }
}

// Set up periodic cache cleanup
setInterval(cleanupRoleCache, 60000); // Clean every minute

