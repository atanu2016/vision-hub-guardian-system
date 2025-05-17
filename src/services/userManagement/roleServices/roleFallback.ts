
/**
 * Fallback methods for updating user roles using Edge Functions
 */

import { supabase } from '@/integrations/supabase/client';
import type { UserRole } from '@/types/admin';

/**
 * Updates a user's role via the edge function fallback mechanism
 */
export async function updateRoleViaEdgeFunction(userId: string, role: UserRole): Promise<void> {
  console.log(`[Role Fallback] Updating role via edge function: ${userId} to ${role}`);
  
  // Validate the role as a safeguard
  const validRoles: UserRole[] = ['user', 'admin', 'superadmin', 'observer'];  
  if (!validRoles.includes(role)) {
    throw new Error(`Invalid role: ${role}`);
  }
  
  try {
    const { data, error } = await supabase.functions.invoke('fix-user-roles', {
      body: { 
        action: 'fix',
        userId, 
        role 
      }
    });
    
    if (error) {
      console.error('[Role Fallback] Edge function error:', error);
      throw error;
    }
    
    if (!data.success) {
      console.error('[Role Fallback] Edge function reported failure:', data);
      throw new Error(data.error || 'Edge function failed to update role');
    }
    
    console.log('[Role Fallback] Edge function role update successful');
    return;
  } catch (error) {
    console.error('[Role Fallback] Error invoking fix-user-roles edge function:', error);
    throw error;
  }
}
