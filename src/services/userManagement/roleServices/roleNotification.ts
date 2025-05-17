
/**
 * Notification services for role changes
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Helper function to notify about role changes via RPC if available
 */
export async function notifyRoleChange(userId: string): Promise<void> {
  try {
    console.log('[Role Notification] Attempting to notify about role change');
    
    // Try to use notify_role_change RPC if it exists
    try {
      const { error: signalError } = await supabase
        .rpc('notify_role_change', { user_id: userId });
        
      if (signalError) {
        console.warn('[Role Notification] Error signaling role change:', signalError);
      } else {
        console.log('[Role Notification] Successfully notified about role change');
      }
    } catch (err) {
      console.warn('[Role Notification] notify_role_change RPC might not exist:', err);
    }
  } catch (err) {
    console.error('[Role Notification] Error calling notify_role_change:', err);
  }
}

/**
 * Trigger role change notifications via realtime update
 */
export async function triggerRealtimeNotification(userId: string): Promise<void> {
  try {
    await supabase
      .from('user_roles')
      .update({ updated_at: new Date().toISOString() })
      .eq('user_id', userId);
      
    console.log('[Role Notification] Triggered realtime notification for role change');
  } catch (notifyError) {
    console.error('[Role Notification] Error triggering role change notification:', notifyError);
  }
}
