
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logUserActivity } from '@/services/activityLoggingService';
import { UserRole } from '@/types/admin';

/**
 * Deletes a user from the system
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    console.log(`[DELETE-USER] Starting deletion process for user: ${userId}`);
    
    // Get the current user's role for logging
    const { data: sessionData } = await supabase.auth.getSession();
    const actorEmail = sessionData?.session?.user?.email;
    let actorRole: UserRole | undefined;
    
    if (sessionData?.session?.user) {
      // Query the user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', sessionData.session.user.id)
        .single();
      
      if (roleError || !roleData) {
        console.error('[DELETE-USER] Error fetching actor role:', roleError);
        actorRole = 'user';
      } else {
        actorRole = roleData.role as UserRole;
      }
    }

    // Prevent self-deletion
    if (userId === sessionData?.session?.user?.id) {
      throw new Error('You cannot delete your own account');
    }

    // Get the user's data for logging
    const { data: userData } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();
      
    // Get the user's role for logging
    const { data: userRoleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
      
    const userRole = userRoleData?.role || 'unknown';

    console.log(`[DELETE-USER] Attempting to delete user: ${userId}, role: ${userRole}`);

    // Check if current user can delete the target user based on roles
    if ((userRole === 'admin' || userRole === 'superadmin') && actorRole !== 'superadmin') {
      throw new Error('Only superadmins can delete admin users');
    }

    // Call our edge function to delete the user
    const { data, error } = await supabase.functions.invoke('admin-delete-user', {
      body: { user_id: userId }
    });

    // If there's an error with the edge function, try direct database cleanup
    if (error) {
      console.error('[DELETE-USER] Edge function error:', error);
      
      // Clean up database records even if edge function fails
      // Delete user_roles
      const { error: rolesError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      
      if (rolesError) {
        console.error('[DELETE-USER] Error deleting user roles:', rolesError);
      }
      
      // Delete user camera assignments
      const { error: cameraError } = await supabase
        .from('user_camera_access')
        .delete()
        .eq('user_id', userId);
      
      if (cameraError) {
        console.error('[DELETE-USER] Error deleting camera access:', cameraError);
      }
      
      // Delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
        
      if (profileError) {
        console.error('[DELETE-USER] Error deleting profile:', profileError);
      }
      
      throw new Error('Failed to delete user authentication record. Database records cleaned up.');
    }

    console.log(`[DELETE-USER] Successfully deleted user: ${userId}`);

    // Log the user deletion with enhanced details
    await logUserActivity(
      'User deleted',
      `User ${userData?.full_name || 'unknown'} (role: ${userRole}) was deleted by ${actorEmail} (${actorRole || 'unknown'})`,
      userId,
      actorEmail,
      actorRole
    );

    toast.success('User deleted successfully');
  } catch (error: any) {
    console.error('[DELETE-USER] Error:', error);
    toast.error(error.message || 'Failed to delete user');
    throw error;
  }
}
