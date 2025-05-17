
/**
 * Fallback mechanisms for updating roles when standard methods fail
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { UserRole } from '@/types/admin';

/**
 * Edge function fallback for role updates when regular DB operations fail
 */
export async function updateRoleViaEdgeFunction(userId: string, newRole: UserRole): Promise<boolean> {
  console.log('[Role Fallback] Attempting to use fix-user-roles function as fallback...');
  
  try {
    const { error: fnError } = await supabase.functions.invoke('fix-user-roles', {
      body: { action: 'fix', userId, role: newRole }
    });
    
    if (fnError) {
      console.error('[Role Fallback] Edge function failed:', fnError);
      throw fnError;
    } else {
      console.log('[Role Fallback] Successfully updated role via edge function');
      toast.success(`User role updated to ${newRole}`);
      return true;
    }
  } catch (fallbackError: any) {
    console.error('[Role Fallback] Fallback also failed:', fallbackError);
    throw new Error(`Edge function fallback failed: ${fallbackError.message || 'Unknown error'}`);
  }
}
