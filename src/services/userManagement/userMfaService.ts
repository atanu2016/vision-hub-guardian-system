
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Toggles the MFA requirement for a user
 */
export async function toggleMfaRequirement(userId: string, required: boolean): Promise<void> {
  try {
    console.log(`Setting MFA requirement to ${required} for user ${userId}`);
    
    // Call the admin edge function instead of directly updating the profile
    // This bypasses RLS issues with the profiles table
    const { error } = await supabase.functions.invoke('get-all-users', {
      method: 'PUT',
      body: { 
        userId: userId,
        action: 'toggle_mfa_requirement',
        mfaRequired: required
      }
    });
      
    if (error) {
      console.error('Error toggling MFA requirement:', error);
      throw new Error(error.message || 'Failed to update MFA setting');
    }
    
    toast.success(`MFA requirement ${required ? 'enabled' : 'disabled'} for user`);
  } catch (error: any) {
    console.error('Error toggling MFA requirement:', error);
    toast.error(error.message || 'Failed to update MFA setting');
    throw error;
  }
}

/**
 * Revokes MFA enrollment for a user, forcing them to re-enroll
 */
export async function revokeMfaEnrollment(userId: string): Promise<void> {
  try {
    console.log(`Revoking MFA enrollment for user ${userId}`);
    
    // Call function to remove MFA factors using our edge function
    const { error } = await supabase.functions.invoke('get-all-users', {
      method: 'PUT',
      body: { 
        userId: userId,
        action: 'revoke_mfa'
      }
    });
    
    if (error) {
      console.error('Error calling MFA revoke function:', error);
      throw new Error(error.message || 'Failed to revoke MFA enrollment');
    }
    
    toast.success('MFA enrollment revoked - user will need to re-enroll');
  } catch (error: any) {
    console.error('Error revoking MFA enrollment:', error);
    toast.error(error.message || 'Failed to revoke MFA enrollment');
    throw error;
  }
}

/**
 * Updates the user's own MFA settings
 */
export async function updatePersonalMfaSetting(enabled: boolean): Promise<void> {
  try {
    const user = await supabase.auth.getUser();
    if (!user || !user.data.user) {
      throw new Error("User not authenticated");
    }
    
    const { data: userData } = user;
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
