
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
      throw new Error("Cannot downgrade your own superadmin role");
    }

    // Get current role for logging - use cache if available
    let oldRole: UserRole = 'user';
    const cachedRole = roleCache.get(userId);
    
    if (cachedRole && (Date.now() - cachedRole.timestamp < CACHE_TIMEOUT)) {
      oldRole = cachedRole.role;
      console.log(`[Role Service] Using cached role: ${oldRole}`);
    } else {
      const { data: currentRoleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (roleError) {
        console.error('[Role Service] Error fetching current role:', roleError);
      }
      
      oldRole = (currentRoleData?.role as UserRole) || 'user';
      console.log(`[Role Service] Current role from DB: ${oldRole}, New role: ${newRole}`);
      
      // Update cache with fetched role
      roleCache.set(userId, { role: oldRole, timestamp: Date.now() });
    }

    // Check if user role already exists
    const { data: existingRole, error: existingRoleError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (existingRoleError) {
      console.error('[Role Service] Error checking existing role:', existingRoleError);
    }

    let error;
    
    if (existingRole) {
      // Update existing role - using update instead of upsert for existing records
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
        
        // Try to notify about role change
        await notifyRoleChange(userId);
      }
    } else {
      // Insert new role
      console.log(`[Role Service] Creating new role record for user ${userId}`);
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ 
          user_id: userId, 
          role: newRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      error = insertError;
      if (insertError) {
        console.error('[Role Service] Error inserting role:', insertError);
      } else {
        console.log(`[Role Service] Role successfully created as ${newRole}`);
        
        // Update the cache with new role
        roleCache.set(userId, { role: newRole, timestamp: Date.now() });
        
        // Try to notify about role change
        await notifyRoleChange(userId);
      }
    }

    if (error) throw error;
    
    // Log this action
    try {
      await logRoleChange(userId, oldRole, newRole);
    } catch (logError) {
      console.error('[Role Service] Error logging role change:', logError);
      // Continue despite logging error
    }
    
    toast.success(`User role updated to ${newRole}`);
    
    // Trigger role change notifications via realtime
    try {
      await supabase
        .from('user_roles')
        .update({ updated_at: new Date().toISOString() })
        .eq('user_id', userId);
    } catch (notifyError) {
      console.error('[Role Service] Error triggering role change notification:', notifyError);
    }
    
    return;
  } catch (error: any) {
    console.error('Error updating user role:', error);
    toast.error('Failed to update user role: ' + (error.message || 'Unknown error'));
    throw error;
  }
}

/**
 * Helper function to notify about role changes via RPC if available
 */
async function notifyRoleChange(userId: string): Promise<void> {
  try {
    console.log('[Role Service] Attempting to notify about role change');
    
    // Try to use notify_role_change RPC if it exists
    const { error: signalError } = await supabase
      .rpc('notify_role_change', { user_id: userId })
      .catch((err) => {
        console.warn('[Role Service] notify_role_change RPC might not exist:', err);
        return { error: err };
      });
      
    if (signalError) {
      console.warn('[Role Service] Error signaling role change:', signalError);
    } else {
      console.log('[Role Service] Successfully notified about role change');
    }
  } catch (err) {
    console.error('[Role Service] Error calling notify_role_change:', err);
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
      
    if (error) {
      console.error('[Role Service] Error checking user role:', error);
      throw error;
    }
    
    // Update cache if we got data
    if (data) {
      roleCache.set(userId, { role: data.role as UserRole, timestamp: Date.now() });
    }
    
    return !!data;
  } catch (error) {
    console.error('[Role Service] Error checking user role:', error);
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
