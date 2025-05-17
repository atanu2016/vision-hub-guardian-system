
import { supabase } from '@/integrations/supabase/client';
import { MfaAction } from './types';

/**
 * Logs MFA-related actions to the system_logs table
 */
export async function logMfaAction(
  action: MfaAction,
  userId: string
): Promise<void> {
  try {
    const actionMessages = {
      enable: 'MFA enabled for user',
      disable: 'MFA disabled for user',
      revoke: 'MFA revoked for user',
      enroll: 'MFA enrolled for user'
    };
    
    // Get user email for better logs
    const { data: userData } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();
    
    const userIdentifier = userData?.full_name || userId;
    
    // Log to system_logs
    await supabase.from('system_logs').insert({
      level: action === 'revoke' || action === 'disable' ? 'warning' : 'info',
      source: 'security',
      message: actionMessages[action],
      details: `${actionMessages[action]} ${userIdentifier}`
    });
  } catch (error) {
    console.error('Error logging MFA action:', error);
    // Don't throw here - we don't want to fail the main operation if logging fails
  }
}
