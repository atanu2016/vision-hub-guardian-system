
/**
 * User role management services - main entry point
 */

import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { UserRole } from '@/types/admin';
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
    const cachedRole = getCachedRole(userId);
    
    if (cachedRole) {
      oldRole = cachedRole;
      console.log(`[Role Service] Using cached role: ${oldRole}`);
    } else {
      try {
        oldRole = await fetchUserRole(userId);
        console.log(`[Role Service] Current role from DB: ${oldRole}, New role: ${newRole}`);
      } catch (roleError) {
        console.error('[Role Service] Error fetching current role:', roleError);
      }
    }

    // Try using direct update/insert first
    try {
      // Check if user role already exists
      const roleExists = await checkRoleExists(userId);
      
      if (roleExists) {
        console.log('[Role Service] Role exists, updating existing role');
        // Update existing role
        await updateExistingRole(userId, newRole);
      } else {
        console.log('[Role Service] Role does not exist, inserting new role');
        // Insert new role
        await insertNewRole(userId, newRole);
      }
      
      // Update the cache with new role
      setCachedRole(userId, newRole);
      
      // Try to notify about role change
      await notifyRoleChange(userId);
      
    } catch (error: any) {
      console.error('[Role Service] Error updating role with direct approach:', error);
      
      // Retry using Edge Functions as fallback
      try {
        console.log('[Role Service] Attempting fallback via edge function...');
        await updateRoleViaEdgeFunction(userId, newRole);
        // Update the cache with new role if edge function succeeded
        setCachedRole(userId, newRole);
        toast.success(`User role updated to ${newRole} (via fallback)`);
        return;
      } catch (fallbackError: any) {
        // If both methods fail, try one more direct approach with different syntax
        try {
          console.log('[Role Service] Attempting final direct insertion...');
          const { error: finalError } = await supabase
            .from('user_roles')
            .upsert({
              user_id: userId,
              role: newRole,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            });
            
          if (finalError) {
            console.error('[Role Service] Final attempt also failed:', finalError);
            throw finalError;
          } else {
            console.log('[Role Service] Final direct insertion succeeded');
            setCachedRole(userId, newRole);
            toast.success(`User role updated to ${newRole} (final attempt)`);
            return;
          }
        } catch (finalAttemptError) {
          console.error('[Role Service] All role update methods failed:', finalAttemptError);
          throw error || fallbackError || finalAttemptError;
        }
      }
    }

    toast.success(`User role updated to ${newRole}`);
    
    // Trigger role change notifications via realtime
    try {
      await triggerRealtimeNotification(userId);
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
 * Checks if a user has a specific role
 */
export async function hasRole(userId: string, role: UserRole): Promise<boolean> {
  return checkUserHasRole(userId, role);
}

/**
 * Invalidate the role cache for a specific user or completely
 */
export { invalidateRoleCache };
