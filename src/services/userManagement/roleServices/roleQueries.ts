
/**
 * Optimized database queries for user roles
 */

import { supabase } from '@/integrations/supabase/client';
import type { UserRole } from '@/contexts/auth/types';
import { getCachedRole, setCachedRole } from './roleCache';

// Query result caching mechanism
const queryCache = new Map<string, {data: any, timestamp: number}>();
const QUERY_CACHE_TTL = 15000; // 15 seconds

/**
 * Optimized role fetching with caching
 */
export async function fetchUserRole(userId: string): Promise<UserRole> {
  // Try to use cache first for maximum performance
  const cachedRole = getCachedRole(userId);
  if (cachedRole) {
    return cachedRole;
  }
  
  // Check query cache
  const cacheKey = `role:${userId}`;
  const cachedQuery = queryCache.get(cacheKey);
  if (cachedQuery && (Date.now() - cachedQuery.timestamp < QUERY_CACHE_TTL)) {
    setCachedRole(userId, cachedQuery.data);
    return cachedQuery.data;
  }
  
  // Perform optimized database query
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();
    
  if (error) {
    throw error;
  }
  
  // Validate and process result
  const validRoles: UserRole[] = ['user', 'admin', 'superadmin', 'observer'];
  const role = data?.role as UserRole;
  
  // Default to 'user' if role is invalid or not found
  const finalRole = (role && validRoles.includes(role)) ? role : 'user';
  
  // Update both caches
  setCachedRole(userId, finalRole);
  queryCache.set(cacheKey, {
    data: finalRole,
    timestamp: Date.now()
  });
  
  return finalRole;
}

/**
 * Optimized check if a role exists
 */
export async function checkRoleExists(userId: string): Promise<boolean> {
  // Use optimized query with count for better performance
  const { count, error } = await supabase
    .from('user_roles')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
    
  if (error) {
    throw error;
  }
  
  return (count || 0) > 0;
}

/**
 * Update existing role with optimized query
 */
export async function updateExistingRole(userId: string, newRole: UserRole): Promise<void> {
  const { error } = await supabase
    .from('user_roles')
    .update({ 
      role: newRole, 
      updated_at: new Date().toISOString() 
    })
    .eq('user_id', userId);
    
  if (error) {
    throw error;
  }
  
  // Clear related caches
  queryCache.delete(`role:${userId}`);
}

/**
 * Insert new role with optimized query
 */
export async function insertNewRole(userId: string, newRole: UserRole): Promise<void> {
  const { error } = await supabase
    .from('user_roles')
    .insert({ 
      user_id: userId, 
      role: newRole,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
  if (error) {
    throw error;
  }
  
  // Clear related caches
  queryCache.delete(`role:${userId}`);
}

/**
 * Optimized role check with caching
 */
export async function checkUserHasRole(userId: string, role: UserRole): Promise<boolean> {
  try {
    // Use cached role if available
    const cachedRole = getCachedRole(userId);
    if (cachedRole) {
      return cachedRole === role;
    }
    
    // Use optimized query with count for better performance
    const { count, error } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('role', role);
      
    if (error) {
      throw error;
    }
    
    return (count || 0) > 0;
  } catch (error) {
    console.error('[Role Queries] Error checking user role:', error);
    return false;
  }
}

// Add cache cleanup function
export function cleanupQueryCache(): void {
  const now = Date.now();
  for (const [key, entry] of queryCache.entries()) {
    if (now - entry.timestamp > QUERY_CACHE_TTL * 2) {
      queryCache.delete(key);
    }
  }
}

// Set up periodic cache cleanup
setInterval(cleanupQueryCache, 60000); // Clean every minute
