
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logUserActivity } from '@/services/activityLoggingService';
import { UserRole } from '@/types/admin';

/**
 * Deletes a user from the system
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    // Get the current user's role for logging
    const { data: sessionData } = await supabase.auth.getSession();
    const actorEmail = sessionData?.session?.user?.email;
    let actorRole: UserRole | undefined;
    
    if (sessionData?.session?.user) {
      // Query the user_roles table instead of profiles
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', sessionData.session.user.id)
        .single();
      
      if (roleError || !roleData) {
        console.error('Error fetching actor role:', roleError);
        actorRole = 'user';
      } else {
        actorRole = roleData.role as UserRole;
      }
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

    // Delete the user using admin API
    const { error } = await supabase.functions.invoke('admin-delete-user', {
      body: { user_id: userId }
    });

    if (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }

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
    console.error('Error deleting user:', error);
    toast.error(error.message || 'Failed to delete user');
    throw error;
  }
}
