
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Deletes a user and all their associated data
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    console.log("Deleting user:", userId);
    
    // Delete user using admin API
    const { error } = await supabase.auth.admin.deleteUser(userId);
    
    if (error) throw error;
    
    // Note: Due to cascade delete settings, the user's profile and roles will be automatically deleted
    
    toast.success('User deleted successfully');
  } catch (error: any) {
    console.error('Error deleting user:', error);
    toast.error(error.message || 'Failed to delete user');
    throw error;
  }
}
