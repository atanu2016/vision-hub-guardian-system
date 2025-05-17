
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logUserActivity } from '@/services/activityLoggingService';

/**
 * Deletes a user from the system
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    // Get the user's email for logging
    const { data: userData } = await supabase
      .from('profiles')
      .select('full_name')
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

    // Log the user deletion
    await logUserActivity(
      'User deleted',
      `User ${userData?.full_name || 'unknown'} was deleted`,
      userId
    );

    toast.success('User deleted successfully');
  } catch (error: any) {
    console.error('Error deleting user:', error);
    toast.error(error.message || 'Failed to delete user');
    throw error;
  }
}
