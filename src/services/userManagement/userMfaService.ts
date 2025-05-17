
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Toggles the MFA requirement for a user
 */
export async function toggleMfaRequirement(userId: string, required: boolean): Promise<void> {
  try {
    console.log(`Setting MFA requirement to ${required} for user ${userId}`);
    
    // Check admin status first
    const { data: isAdmin } = await supabase.rpc('check_admin_status');
    if (!isAdmin) {
      throw new Error('Permission denied: Admin access required');
    }
    
    // Update the profile for the specific user
    const { error } = await supabase
      .from('profiles')
      .update({
        mfa_required: required
      })
      .eq('id', userId);
      
    if (error) {
      console.error('Error toggling MFA requirement:', error);
      throw error;
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
    
    // Check admin status first
    const { data: isAdmin } = await supabase.rpc('check_admin_status');
    if (!isAdmin) {
      throw new Error('Permission denied: Admin access required');
    }
    
    // Update profile to clear mfa_enrolled and mfa_secret
    const { error } = await supabase
      .from('profiles')
      .update({
        mfa_enrolled: false,
        mfa_secret: null
      })
      .eq('id', userId);
      
    if (error) {
      console.error('Error revoking MFA enrollment:', error);
      throw error;
    }
    
    // Call function to remove MFA factors if we're using Supabase MFA directly
    try {
      await supabase.functions.invoke('get-all-users', {
        method: 'PUT',
        body: { 
          userId: userId,
          action: 'revoke_mfa'
        }
      });
    } catch (mfaError) {
      console.error('Error calling MFA revoke function:', mfaError);
      // Continue anyway since we've already updated the profile
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
