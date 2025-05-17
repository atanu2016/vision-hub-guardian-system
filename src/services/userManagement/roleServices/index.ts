
/**
 * User role management services - main entry point
 */

import { toast } from 'sonner';
import { logRoleChange } from '@/services/activityLoggingService';
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
    
    // Don't allow changing your own role if you're a superadmin
    if (userId === currentUserId && newRole !== 'superadmin') {
      toast.error("You cannot downgrade your own superadmin role");
      throw new Error("Cannot downgrade your own superadmin role");
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

    try {
      // Check if user role already exists
      const roleExists = await checkRoleExists(userId);
      
      if (roleExists) {
        // Update existing role
        await updateExistingRole(userId, newRole);
      } else {
        // Insert new role
        await insertNewRole(userId, newRole);
      }
      
      // Update the cache with new role
      setCachedRole(userId, newRole);
      
      // Try to notify about role change
      await notifyRoleChange(userId);
      
    } catch (error: any) {
      console.error('[Role Service] Error updating role:', error);
      
      // Try using the edge function as fallback
      try {
        await updateRoleViaEdgeFunction(userId, newRole);
        // Update the cache with new role if edge function succeeded
        setCachedRole(userId, newRole);
        return;
      } catch (fallbackError) {
        console.error('[Role Service] All role update methods failed:', fallbackError);
        throw error || fallbackError;
      }
    }

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
