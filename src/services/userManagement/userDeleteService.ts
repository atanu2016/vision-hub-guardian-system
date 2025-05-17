
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Deletes a user and all their associated data
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    console.log("Deleting user:", userId);
    
    // Get the current user session to ensure we don't delete our own account
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id === userId) {
      throw new Error('Cannot delete your own account');
    }

    // Call the edge function to delete the user completely
    const { error } = await supabase.functions.invoke('get-all-users', {
      method: 'DELETE',
      body: { userId }
    });
    
    if (error) {
      console.error('Error calling delete user function:', error);
      throw new Error(error.message || 'Failed to delete user');
    }
    
    toast.success('User deleted successfully');
  } catch (error: any) {
    console.error('Error deleting user:', error);
    toast.error(error.message || 'Failed to delete user');
    throw error;
  }
}
