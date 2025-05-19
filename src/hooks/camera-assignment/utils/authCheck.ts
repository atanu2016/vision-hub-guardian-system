
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Checks if user has a valid session before proceeding with camera operations
 * @returns true if authenticated, false otherwise
 */
export const checkAuthentication = async (): Promise<boolean> => {
  try {
    // Check for valid session before making any requests
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Authentication error:", sessionError);
      toast.error("Authentication error: " + sessionError.message);
      return false;
    }
    
    if (!sessionData.session) {
      console.error("No active session found");
      
      // Use toast with redirection to ensure user knows they're being redirected
      toast.error("Your session has expired. Please login again.", {
        onDismiss: () => {
          window.location.href = '/auth';
        },
        duration: 4000
      });
      
      return false;
    }
    
    // Verify session is still valid with backend check
    try {
      const { data: validCheck, error: validError } = await supabase.rpc('check_session_valid');
      
      if (validError || validCheck !== true) {
        console.error("Session validation failed:", validError || "Backend check returned false");
        toast.error("Session validation failed. Please login again.", {
          onDismiss: () => {
            window.location.href = '/auth';
          },
          duration: 3000
        });
        return false;
      }
    } catch (validationError) {
      console.error("Error validating session:", validationError);
      // Continue with normal flow if RPC doesn't exist yet - fallback behavior
    }
    
    return true;
  } catch (error: any) {
    console.error("Error in authentication check:", error);
    toast.error("Authentication error: " + (error?.message || "Unknown error"));
    return false;
  }
};
