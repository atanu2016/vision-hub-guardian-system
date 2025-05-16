
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Toggles the MFA requirement for a user
 */
export async function toggleMfaRequirement(userId: string, required: boolean): Promise<void> {
  try {
    // Updated to target the specific user's profile
    const { error } = await supabase
      .from('profiles')
      .update({
        mfa_required: required
      })
      .eq('id', userId);
      
    if (error) throw error;
    
    toast.success(`MFA requirement ${required ? 'enabled' : 'disabled'} for user`);
  } catch (error) {
    console.error('Error toggling MFA requirement:', error);
    toast.error('Failed to update MFA setting');
    throw error;
  }
}

/**
 * Updates the user's own MFA settings
 */
export async function updatePersonalMfaSetting(enabled: boolean): Promise<void> {
  try {
    const user = supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const { data: userData } = await user;
    if (!userData?.user?.id) {
      throw new Error("User ID not found");
    }
    
    const { error } = await supabase
      .from('profiles')
      .update({
        mfa_enrolled: enabled,
        mfa_secret: enabled ? null : undefined // Clear secret when disabling
      })
      .eq('id', userData.user.id);
      
    if (error) throw error;
    
    toast.success(`MFA ${enabled ? 'enabled' : 'disabled'} successfully`);
  } catch (error) {
    console.error('Error updating personal MFA setting:', error);
    toast.error('Failed to update MFA setting');
    throw error;
  }
}
