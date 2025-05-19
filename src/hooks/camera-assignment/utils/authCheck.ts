
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
      window.location.href = '/auth';
      return false;
    }
    
    if (!sessionData.session) {
      console.error("No active session found");
      toast.error("Your session has expired. Please login again.");
      window.location.href = '/auth';
      return false;
    }
    
    // Do an explicit refresh of the session token before proceeding
    try {
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error("Failed to refresh session:", refreshError);
        toast.error("Session refresh failed. Please login again.");
        window.location.href = '/auth';
        return false;
      }
      
      console.log("Session refreshed successfully");
    } catch (refreshError) {
      console.error("Error refreshing token:", refreshError);
      // Continue with existing token as a fallback
    }
    
    // Quick session validation - fail fast if not valid
    try {
      const { data, error } = await supabase.rpc('check_session_valid' as any);
      
      if (error) {
        console.error("Session validation failed:", error);
        toast.error("Session validation failed. Please login again.");
        window.location.href = '/auth';
        return false;
      }
      
      if (!data) {
        console.error("Session is invalid");
        toast.error("Your session is invalid. Please login again.");
        window.location.href = '/auth';
        return false;
      }
    } catch (validationError) {
      console.warn("Error validating session:", validationError);
      // Non-critical, continue with other checks
    }
    
    return true;
  } catch (error: any) {
    console.error("Error in authentication check:", error);
    toast.error("Authentication error: " + (error?.message || "Unknown error"));
    window.location.href = '/auth';
    return false;
  }
};
