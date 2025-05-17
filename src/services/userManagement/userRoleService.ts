
import { supabase } from '@/integrations/supabase/client';
import type { UserRole } from '@/types/admin';
import { toast } from 'sonner';
import { logRoleChange, logUserActivity } from '@/services/activityLoggingService';

/**
 * Updates a user's role in the database
 */
export async function updateUserRole(userId: string, newRole: UserRole, currentUserId?: string): Promise<void> {
  try {
    console.log(`[Role Service] Updating role for user ${userId} to ${newRole}`);
    
    // Don't allow changing your own role if you're a superadmin
    if (userId === currentUserId && newRole !== 'superadmin') {
      toast.error("You cannot downgrade your own superadmin role");
      return;
    }

    // Get current role for logging
    const { data: currentRoleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    
    const oldRole = currentRoleData?.role || 'user';
    console.log(`[Role Service] Current role: ${oldRole}, New role: ${newRole}`);

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
      }
    }

    if (error) throw error;
    
    // Log this action
    await logRoleChange(userId, oldRole as UserRole, newRole);
    
    toast.success(`User role updated to ${newRole}`);
  } catch (error) {
    console.error('Error updating user role:', error);
    toast.error('Failed to update user role');
    throw error;
  }
}

/**
 * Checks if a user has a specific role
 */
export async function hasRole(userId: string, role: UserRole): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', role)
      .maybeSingle();
      
    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
}
