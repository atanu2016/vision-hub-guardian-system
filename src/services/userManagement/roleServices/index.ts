/**
 * User role management services - main entry point
 */

import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { UserRole } from '@/contexts/auth/types';
import { fetchUserRole, checkRoleExists, updateExistingRole, insertNewRole, checkUserHasRole } from './roleQueries';
import { getCachedRole, setCachedRole, invalidateRoleCache } from './roleCache';
import { notifyRoleChange, triggerRealtimeNotification } from './roleNotification';
import { updateRoleViaEdgeFunction } from './roleFallback';

/**
 * Updates a user's role in the database with improved performance
 */
export async function updateUserRole(userId: string, newRole: UserRole, currentUserId?: string): Promise<void> {
  try {
    console.log(`[Role Service] Updating role for user ${userId} to ${newRole}`);
    
    // Immediately invalidate cache to ensure fresh data
    invalidateRoleCache(userId);
    
    // Don't allow changing your own role if you're a superadmin to avoid accidentally removing your own permissions
    if (userId === currentUserId && newRole !== 'superadmin') {
      // Special case: allow admin@home.local to change between admin and superadmin
      const { data: { user } } = await supabase.auth.getUser();
      const isSpecialAdmin = user?.email === 'admin@home.local' || user?.email === 'auth@home.local';

      if (!isSpecialAdmin) {
        toast.error("You cannot downgrade your own superadmin role");
        throw new Error("Cannot downgrade your own superadmin role");
      }
    }

    // Get current role for logging
    let oldRole: UserRole = 'user';
    try {
      oldRole = await fetchUserRole(userId);
      console.log(`[Role Service] Current role from DB: ${oldRole}, New role: ${newRole}`);
    } catch (roleError) {
      console.error('[Role Service] Error fetching current role:', roleError);
    }

    // Validate the role is a valid UserRole type
    const validRoles: UserRole[] = ['user', 'superadmin', 'observer'];
    if (!validRoles.includes(newRole)) {
      console.error(`[Role Service] Invalid role specified: ${newRole}`);
      toast.error(`Invalid role: ${newRole}`);
      throw new Error(`Invalid role specified: ${newRole}`);
    }

    // Use multiple approaches for reliability
    let succeeded = false;
    let errorMessages = [];
    
    // Approach 1: Direct update with user_roles table
    try {
      console.log('[Role Service] Trying direct update approach');
      // First check if role exists
      const roleExists = await checkRoleExists(userId);
      
      if (roleExists) {
        console.log('[Role Service] Role exists, updating existing role');
        await updateExistingRole(userId, newRole);
      } else {
        console.log('[Role Service] Role does not exist, inserting new role');
        await insertNewRole(userId, newRole);
      }
      
      // Update cache with new role
      setCachedRole(userId, newRole);
      succeeded = true;
      console.log(`[Role Service] Direct update succeeded`);
      
      // Try to notify about role change
      await notifyRoleChange(userId);
      
    } catch (error: any) {
      console.error('[Role Service] Error with direct approach:', error);
      errorMessages.push(error?.message || 'Direct update failed');
      // Continue to next approach
    }
    
    // Approach 2: upsert operation
    if (!succeeded) {
      try {
        console.log('[Role Service] Attempting upsert operation...');
        const { error } = await supabase
          .from('user_roles')
          .upsert({
            user_id: userId,
            role: newRole,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
          
        if (error) {
          console.error('[Role Service] Upsert failed:', error);
          errorMessages.push(error.message);
        } else {
          console.log('[Role Service] Upsert succeeded');
          setCachedRole(userId, newRole);
          succeeded = true;
        }
      } catch (error: any) {
        console.error('[Role Service] Error with upsert approach:', error);
        errorMessages.push(error?.message || 'Upsert operation failed');
        // Continue to next approach
      }
    }
    
    // Approach 3: Edge Function fallback
    if (!succeeded) {
      try {
        console.log('[Role Service] Attempting fallback via edge function...');
        await updateRoleViaEdgeFunction(userId, newRole);
        // Update the cache with new role
        setCachedRole(userId, newRole);
        console.log(`[Role Service] Edge function approach succeeded`);
        succeeded = true;
      } catch (error: any) {
        console.error('[Role Service] Edge function approach failed:', error);
        errorMessages.push(error?.message || 'Edge function approach failed');
      }
    }
    
    // If all approaches failed, throw error with concatenated messages
    if (!succeeded) {
      const errorMessage = `Failed to update user role: ${errorMessages.join(', ')}`;
      console.error('[Role Service] All role update methods failed:', errorMessage);
      throw new Error(errorMessage);
    }
    
    toast.success(`User role updated to ${newRole}`);
    
    // Trigger role change notification via realtime
    try {
      await triggerRealtimeNotification(userId);
    } catch (notifyError) {
      console.error('[Role Service] Error triggering role change notification:', notifyError);
    }
    
    // Immediately force role reload for the current user if being modified
    if (userId === currentUserId) {
      try {
        console.log('[Role Service] Forcing role reload for current user');
        
        // First update cache
        setCachedRole(userId, newRole);
        
        // Then refresh session
        await supabase.auth.refreshSession();
        console.log('[Role Service] Session refreshed');
        
        // Force another reload in 1 second for good measure
        setTimeout(async () => {
          try {
            const { data: freshRole } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', userId)
              .maybeSingle();
              
            if (freshRole && freshRole.role) {
              console.log(`[Role Service] Secondary refresh fetched role: ${freshRole.role}`);
              setCachedRole(userId, freshRole.role as UserRole);
            }
          } catch (e) {
            console.error('[Role Service] Error in secondary refresh:', e);
          }
        }, 1000);
      } catch (reloadError) {
        console.error('[Role Service] Error forcing role reload:', reloadError);
      }
    }
    
    return;
  } catch (error: any) {
    console.error('Error updating user role:', error);
    toast.error('Failed to update user role: ' + (error.message || 'Unknown error'));
    throw error;
  }
}

/**
 * Checks if a user has a specific role
 */
export async function hasRole(userId: string, role: UserRole): Promise<boolean> {
  return checkUserHasRole(userId, role);
}

/**
 * Invalidate the role cache for a specific user or completely
 */
export { invalidateRoleCache };
