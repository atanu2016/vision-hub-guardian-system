
/**
 * Fallback mechanisms for role updates when direct database access fails
 */

import { supabase } from '@/integrations/supabase/client';
import type { UserRole } from '@/contexts/auth/types';

/**
 * Update a user's role using the edge function as a fallback
 */
export async function updateRoleViaEdgeFunction(userId: string, newRole: UserRole): Promise<boolean> {
  try {
    console.log('[Role Fallback] Attempting to update role via edge function');
    
    // Get authentication token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No session available for edge function authentication');
    }

    // Make the edge function call
    const { data, error } = await supabase.functions.invoke('fix-user-roles', {
      body: JSON.stringify({
        action: 'fix',
        userId,
        role: newRole
      }),
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (error || (data && data.error)) {
      console.error('[Role Fallback] Edge function error:', error || data.error);
      throw new Error(error?.message || data?.error || 'Unknown edge function error');
    }

    if (!data || !data.success) {
      throw new Error('Edge function returned unsuccessful response');
    }

    console.log('[Role Fallback] Role updated successfully via edge function');
    return true;
  } catch (error: any) {
    console.error('[Role Fallback] Error in updateRoleViaEdgeFunction:', error);
    throw error;
  }
}

/**
 * Diagnose user role issues using edge function
 */
export async function diagnoseRoleIssues(): Promise<any> {
  try {
    // Get authentication token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No session available for edge function authentication');
    }

    // Make the edge function call
    const { data, error } = await supabase.functions.invoke('fix-user-roles', {
      body: JSON.stringify({
        action: 'diagnose'
      }),
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (error) {
      console.error('[Role Fallback] Diagnostic edge function error:', error);
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('[Role Fallback] Error in diagnoseRoleIssues:', error);
    throw error;
  }
}
