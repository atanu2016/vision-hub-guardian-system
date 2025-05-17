
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Deletes a user and all their associated data
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    console.log("Deleting user:", userId);
    
    // First check if we have admin permissions
    const { data: isAdmin } = await supabase.rpc('check_admin_status');
    if (!isAdmin) {
      throw new Error('Permission denied: Admin access required');
    }

    // Delete user's profile first (this will automatically trigger cascading deletes)
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
      
    if (profileError) {
      console.error('Error deleting user profile:', profileError);
      throw new Error('Failed to delete user profile');
    }

    // Then use edge function to delete user from auth database
    const { error } = await supabase.functions.invoke('get-all-users', {
      method: 'DELETE',
      body: { userId: userId }
    });
    
    if (error) throw error;
    
    toast.success('User deleted successfully');
  } catch (error: any) {
    console.error('Error deleting user:', error);
    toast.error(error.message || 'Failed to delete user');
    throw error;
  }
}
