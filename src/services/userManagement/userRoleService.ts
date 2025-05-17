
import { supabase } from '@/integrations/supabase/client';
import type { UserRole } from '@/types/admin';
import { toast } from 'sonner';
import { logRoleChange, logUserActivity } from '@/services/activityLoggingService';

// Cache for role information to reduce database queries
const roleCache = new Map<string, { role: UserRole, timestamp: number }>();
const CACHE_TIMEOUT = 30000; // 30 seconds cache

/**
 * Updates a user's role in the database with improved performance
 */
export async function updateUserRole(userId: string, newRole: UserRole, currentUserId?: string): Promise<void> {
  try {
    console.log(`[Role Service] Updating role for user ${userId} to ${newRole}`);
    
    // Don't allow changing your own role if you're a superadmin
    if (userId === currentUserId && newRole !== 'superadmin') {
      toast.error("You cannot downgrade your own superadmin role");
      return;
    }

    // Get current role for logging - use cache if available
    let oldRole: UserRole = 'user';
    const cachedRole = roleCache.get(userId);
    
    if (cachedRole && (Date.now() - cachedRole.timestamp < CACHE_TIMEOUT)) {
      oldRole = cachedRole.role;
      console.log(`[Role Service] Using cached role: ${oldRole}`);
    } else {
      const { data: currentRoleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      
      oldRole = (currentRoleData?.role as UserRole) || 'user';
      console.log(`[Role Service] Current role from DB: ${oldRole}, New role: ${newRole}`);
      
      // Update cache with fetched role
      roleCache.set(userId, { role: oldRole, timestamp: Date.now() });
    }

    // Check if user role already exists
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    let error;
    
    if (existingRole) {
      // Update existing role
      console.log(`[Role Service] Updating existing role record for user ${userId}`);
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({ 
          role: newRole, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', userId);
        
      error = updateError;
      if (updateError) {
        console.error('[Role Service] Error updating role:', updateError);
      } else {
        console.log(`[Role Service] Role successfully updated to ${newRole}`);
        
        // Update the cache with new role
        roleCache.set(userId, { role: newRole, timestamp: Date.now() });
        
        // Add special operator checks
        if (newRole === 'operator') {
          console.log('[Role Service] Operator role assigned - forcing auth refresh');
          
          try {
            // We have to use a type assertion here since the function is new and not in the types yet
            const { error: signalError } = await supabase
              .rpc('notify_role_change' as any, { user_id: userId });
            
            if (signalError) {
              console.warn('[Role Service] Error signaling role change:', signalError);
            }
          } catch (err) {
            console.error('[Role Service] Error calling notify_role_change:', err);
          }
        }
      }
    } else {
      // Insert new role
      console.log(`[Role Service] Creating new role record for user ${userId}`);
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ 
          user_id: userId, 
          role: newRole 
        });
        
      error = insertError;
      if (insertError) {
        console.error('[Role Service] Error inserting role:', insertError);
      } else {
        console.log(`[Role Service] Role successfully created as ${newRole}`);
        
        // Update the cache with new role
        roleCache.set(userId, { role: newRole, timestamp: Date.now() });
        
        // Add special operator checks
        if (newRole === 'operator') {
          console.log('[Role Service] Operator role assigned - forcing auth refresh');
          
          try {
            // We have to use a type assertion here since the function is new and not in the types yet
            const { error: signalError } = await supabase
              .rpc('notify_role_change' as any, { user_id: userId });
            
            if (signalError) {
              console.warn('[Role Service] Error signaling role change:', signalError);
            }
          } catch (err) {
            console.error('[Role Service] Error calling notify_role_change:', err);
          }
        }
      }
    }

    if (error) throw error;
    
    // Log this action
    await logRoleChange(userId, oldRole, newRole);
    
    toast.success(`User role updated to ${newRole}`);
  } catch (error) {
    console.error('Error updating user role:', error);
    toast.error('Failed to update user role');
    throw error;
  }
}

/**
 * Checks if a user has a specific role - with caching for performance
 */
export async function hasRole(userId: string, role: UserRole): Promise<boolean> {
  try {
    // Check cache first
    const cachedRole = roleCache.get(userId);
    if (cachedRole && (Date.now() - cachedRole.timestamp < CACHE_TIMEOUT)) {
      return cachedRole.role === role;
    }
    
    // No valid cache, query the database
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', role)
      .maybeSingle();
      
    if (error) throw error;
    
    // Update cache if we got data
    if (data) {
      roleCache.set(userId, { role: data.role as UserRole, timestamp: Date.now() });
    }
    
    return !!data;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
}

/**
 * Invalidate the role cache for a specific user or completely
 */
export function invalidateRoleCache(userId?: string): void {
  if (userId) {
    roleCache.delete(userId);
  } else {
    roleCache.clear();
  }
}
