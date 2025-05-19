
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
        duration: 4000,
        onDismiss: () => {
          window.location.href = '/auth';
        }
      });
      
      return false;
    }
    
    // Do an explicit refresh of the session token before proceeding
    try {
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error("Failed to refresh session:", refreshError);
        toast.error("Session refresh failed. Please login again.", {
          duration: 3000,
          onDismiss: () => {
            window.location.href = '/auth';
          }
        });
        return false;
      }
      
      // Session refreshed successfully
      console.log("Session refreshed successfully");
    } catch (refreshError) {
      console.error("Error refreshing token:", refreshError);
      // Continue with existing token as a fallback
    }
    
    // Verify session is still valid with backend check if available - but don't break if not
    try {
      // Use any type to bypass TypeScript error for RPC function
      const { data, error } = await supabase.rpc('check_admin_status');
      
      if (error) {
        // If this specific function fails, it might not exist yet - this is non-critical
        console.warn("Admin status check failed:", error);
        // Don't return false here as this is just an additional check
      }
    } catch (validationError) {
      console.warn("Error checking admin status:", validationError);
      // This is non-critical, so we continue
    }
    
    return true;
  } catch (error: any) {
    console.error("Error in authentication check:", error);
    toast.error("Authentication error: " + (error?.message || "Unknown error"));
    return false;
  }
};
