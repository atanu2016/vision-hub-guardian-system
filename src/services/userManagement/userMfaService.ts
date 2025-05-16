
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Toggle MFA requirement for a user
 */
export async function toggleMfaRequirement(userId: string, required: boolean): Promise<void> {
  try {
    // First update the profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ mfa_required: required })
      .eq('id', userId);
      
    if (profileError) throw profileError;
    
    // If MFA is being disabled, also reset MFA enrollment status if needed
    if (!required) {
      // Check if the user has MFA enrolled
      const { data: userData } = await supabase
        .from('profiles')
        .select('mfa_enrolled')
        .eq('id', userId)
        .single();
        
      if (userData && userData.mfa_enrolled) {
        // Reset MFA enrollment status
        const { error: resetError } = await supabase
          .from('profiles')
          .update({ mfa_enrolled: false })
          .eq('id', userId);
          
        if (resetError) throw resetError;
      }
    }
    
    toast.success(`MFA requirement ${required ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error('Error updating MFA requirement:', error);
    toast.error('Failed to update MFA requirement');
    throw error;
  }
}
