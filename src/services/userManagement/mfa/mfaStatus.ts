
import { supabase } from '@/integrations/supabase/client';

/**
 * Checks if MFA is required for a user
 */
export async function isMfaRequired(userId?: string): Promise<boolean> {
  try {
    // If no userId is provided, check for the current user
    if (!userId) {
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
    }
    
    // Query the profiles table for the MFA requirement
    const { data, error } = await supabase
      .from('profiles')
      .select('mfa_required')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    
    return !!data?.mfa_required;
  } catch (error) {
    console.error('Error checking MFA requirement:', error);
    // Default to not required if there's an error
    return false;
  }
}

/**
 * Checks if MFA is enrolled for a user
 */
export async function isMfaEnrolled(userId?: string): Promise<boolean> {
  try {
    // If no userId is provided, check for the current user
    if (!userId) {
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
    }
    
    // Query the profiles table for the MFA enrollment status
    const { data, error } = await supabase
      .from('profiles')
      .select('mfa_enrolled')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    
    return !!data?.mfa_enrolled;
  } catch (error) {
    console.error('Error checking MFA enrollment:', error);
    // Default to not enrolled if there's an error
    return false;
  }
}
