
/**
 * Database queries related to user roles
 */

import { supabase } from '@/integrations/supabase/client';
import type { UserRole } from '@/types/admin';
import { getCachedRole, setCachedRole } from './roleCache';

/**
 * Fetches a user's current role from the database
 */
export async function fetchUserRole(userId: string): Promise<UserRole> {
  // Try to use cache first
  const cachedRole = getCachedRole(userId);
  if (cachedRole) {
    return cachedRole;
  }
  
  console.log(`[Role Queries] Fetching role for user ${userId}`);
  
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();
    
  if (error) {
    console.error('[Role Queries] Error fetching user role:', error);
    throw error;
  }
  
  const role = (data?.role as UserRole) || 'user';
  
  // Update cache with fetched role
  setCachedRole(userId, role);
  
  return role;
}

/**
 * Check if a user role record exists
 */
export async function checkRoleExists(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
    
  if (error) {
    console.error('[Role Queries] Error checking existing role:', error);
    throw error;
  }
  
  return !!data;
}

/**
 * Update an existing role record
 */
export async function updateExistingRole(userId: string, newRole: UserRole): Promise<void> {
  console.log(`[Role Queries] Updating existing role record for user ${userId} to ${newRole}`);
  
  const { error } = await supabase
    .from('user_roles')
    .update({ 
      role: newRole, 
      updated_at: new Date().toISOString() 
    })
    .eq('user_id', userId);
    
  if (error) {
    console.error('[Role Queries] Error updating role:', error);
    throw error;
  }
  
  console.log(`[Role Queries] Role successfully updated to ${newRole}`);
}

/**
 * Insert a new role record
 */
export async function insertNewRole(userId: string, newRole: UserRole): Promise<void> {
  console.log(`[Role Queries] Creating new role record for user ${userId} as ${newRole}`);
  
  const { error } = await supabase
    .from('user_roles')
    .insert({ 
      user_id: userId, 
      role: newRole,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
  if (error) {
    console.error('[Role Queries] Error inserting role:', error);
    throw error;
  }
  
  console.log(`[Role Queries] Role successfully created as ${newRole}`);
}

/**
 * Checks if a user has a specific role - with caching for performance
 */
export async function checkUserHasRole(userId: string, role: UserRole): Promise<boolean> {
  try {
    // Check cache first
    const cachedRole = getCachedRole(userId);
    if (cachedRole) {
      return cachedRole === role;
    }
    
    // No valid cache, query the database
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', role)
      .maybeSingle();
      
    if (error) {
      console.error('[Role Queries] Error checking user role:', error);
      throw error;
    }
    
    // Update cache if we got data
    if (data) {
      setCachedRole(userId, data.role as UserRole);
    }
    
    return !!data;
  } catch (error) {
    console.error('[Role Queries] Error checking user role:', error);
    return false;
  }
}
