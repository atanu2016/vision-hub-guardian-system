
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
      const { data: actorProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', sessionData.session.user.id)
        .single();
      
      actorRole = actorProfile?.role as UserRole;
    }

    // Get the user's data for logging
    const { data: userData } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', userId)
      .single();

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
      `User ${userData?.full_name || 'unknown'} (role: ${userData?.role || 'unknown'}) was deleted by ${actorEmail} (${actorRole || 'unknown'})`,
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
