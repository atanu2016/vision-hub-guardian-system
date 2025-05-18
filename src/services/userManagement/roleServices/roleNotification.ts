
/**
 * Role notification utilities for real-time updates
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Notify about a role change
 */
export async function notifyRoleChange(userId: string): Promise<boolean> {
  try {
    console.log('[Role Notification] Triggering role change notification for user:', userId);
    
    // Try to use the notify function if it exists
    try {
      const { error } = await supabase.rpc('notify_role_change', { user_id: userId });
      
      if (error) {
        console.error('[Role Notification] Error calling notification function:', error);
        return false;
      }
      
      console.log('[Role Notification] Successfully triggered notification');
      return true;
    } catch (error) {
      console.error('[Role Notification] Notify function error:', error);
      return false;
    }
  } catch (error) {
    console.error('[Role Notification] Error in notifyRoleChange:', error);
    return false;
  }
}

/**
 * Trigger a realtime notification by updating a record
 */
export async function triggerRealtimeNotification(userId: string): Promise<boolean> {
  try {
    console.log('[Role Notification] Triggering realtime notification through record update');
    
    // Update the updated_at field to trigger realtime
    const { error } = await supabase
      .from('user_roles')
      .update({ updated_at: new Date().toISOString() })
      .eq('user_id', userId);
      
    if (error) {
      console.error('[Role Notification] Error updating record for notification:', error);
      return false;
    }
    
    console.log('[Role Notification] Successfully triggered realtime notification');
    return true;
  } catch (error) {
    console.error('[Role Notification] Error in triggerRealtimeNotification:', error);
    return false;
  }
}
