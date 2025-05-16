
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Toggles the MFA requirement for a user
 */
export async function toggleMfaRequirement(userId: string, required: boolean): Promise<void> {
  try {
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
