
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Comprehensive MFA service that handles all MFA operations
 */

/**
 * Toggles the MFA requirement for a user
 */
export async function toggleMfaRequirement(userId: string, required: boolean): Promise<void> {
  try {
    console.log(`Setting MFA requirement to ${required} for user ${userId}`);
    
    // Call the admin edge function instead of directly updating the profile
    // This bypasses RLS issues with the profiles table
    const { error } = await supabase.functions.invoke('get-all-users', {
      method: 'PUT',
      body: { 
        userId: userId,
        action: 'toggle_mfa_requirement',
        mfaRequired: required
      }
    });
      
    if (error) {
      console.error('Error toggling MFA requirement:', error);
      throw new Error(error.message || 'Failed to update MFA setting');
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
    
    // Call function to remove MFA factors using our edge function
    const { error } = await supabase.functions.invoke('get-all-users', {
      method: 'PUT',
      body: { 
        userId: userId,
        action: 'revoke_mfa'
      }
    });
    
    if (error) {
      console.error('Error calling MFA revoke function:', error);
      throw new Error(error.message || 'Failed to revoke MFA enrollment');
    }
    
    // Log the action
    await logMfaAction('revoke', userId);
    
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
    const user = await supabase.auth.getUser();
    if (!user || !user.data.user) {
      throw new Error("User not authenticated");
    }
    
    const { data: userData } = user;
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
    
    // Log the action
    await logMfaAction(enabled ? 'enable' : 'disable', userData.user.id);
    
    toast.success(`MFA ${enabled ? 'enabled' : 'disabled'} successfully`);
  } catch (error) {
    console.error('Error updating personal MFA setting:', error);
    toast.error('Failed to update MFA setting');
    throw error;
  }
}

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

/**
 * Gets the MFA requirements for the current user
 * Returns an object with the user's MFA status
 */
export async function getUserMfaStatus(): Promise<{
  isRequired: boolean;
  isEnrolled: boolean;
  needsSetup: boolean;
}> {
  try {
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;
    
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('mfa_required, mfa_enrolled')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    
    const isRequired = !!profileData?.mfa_required;
    const isEnrolled = !!profileData?.mfa_enrolled;
    
    // User needs setup if MFA is required but not enrolled
    const needsSetup = isRequired && !isEnrolled;
    
    return {
      isRequired,
      isEnrolled,
      needsSetup
    };
  } catch (error) {
    console.error('Error getting MFA status:', error);
    // Return default values if there's an error
    return {
      isRequired: false,
      isEnrolled: false,
      needsSetup: false
    };
  }
}

/**
 * Verifies a TOTP code against a user's MFA secret
 * This is a mock function since we don't have real TOTP verification
 * In a real app, use a library like 'otplib' to verify codes
 */
export async function verifyTotpCode(
  secret: string,
  code: string
): Promise<boolean> {
  try {
    // For demo purposes, we're just checking if the code is 6 digits
    // In a real app, use a library like 'otplib' to verify the code
    const isValidFormat = /^\d{6}$/.test(code);
    
    if (!isValidFormat) {
      return false;
    }
    
    // In a real implementation, this would verify the TOTP code
    // For demo purposes, we're just returning true for any 6-digit code
    return true;
  } catch (error) {
    console.error('Error verifying TOTP code:', error);
    return false;
  }
}

/**
 * Logs MFA-related actions to the system_logs table
 */
async function logMfaAction(
  action: 'enable' | 'disable' | 'revoke' | 'enroll', 
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

/**
 * Generates a TOTP secret for MFA enrollment
 */
export function generateTotpSecret(): string {
  // In a real app, use a library like 'otplib' to generate a proper secret
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

/**
 * Generates a QR code URL for MFA enrollment
 */
export async function generateQrCodeUrl(
  email: string | undefined,
  secret: string
): Promise<string> {
  try {
    // Create OTP auth URL (RFC 6238)
    const appName = 'VisionHub';
    const userIdentifier = email || 'user';
    const otpAuthUrl = `otpauth://totp/${encodeURIComponent(appName)}:${encodeURIComponent(userIdentifier)}?secret=${secret}&issuer=${encodeURIComponent(appName)}`;
    
    // Use a QR code generation API
    // In a production app, consider using a local QR code generator
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpAuthUrl)}`;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}
