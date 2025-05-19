
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * More robust authentication check that handles various edge cases
 * @returns true if authenticated, false otherwise
 */
export const checkAuthentication = async (): Promise<boolean> => {
  try {
    // First try getting the current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Authentication error:", sessionError);
      toast.error("Authentication error: " + sessionError.message);
      
      // If we have a session error, attempt to redirect to auth page and return false
      setTimeout(() => window.location.href = '/auth', 500);
      return false;
    }
    
    // No session found
    if (!sessionData.session) {
      console.error("No active session found");
      toast.error("Your session has expired. Please login again.");
      
      // Save current path for redirect after login
      const currentPath = window.location.pathname;
      // Navigate to auth page while preserving the return path
      setTimeout(() => {
        window.location.href = `/auth?returnTo=${encodeURIComponent(currentPath)}`;
      }, 500);
      return false;
    }
    
    // We have a session, let's try to refresh it
    try {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error("Failed to refresh session:", refreshError);
        
        // If refresh fails, check if the original session is still valid
        if (sessionData.session && new Date(sessionData.session.expires_at * 1000) > new Date()) {
          console.log("Using existing valid session despite refresh failure");
          // Continue with existing token
          return true;
        }
        
        toast.error("Session refresh failed. Please login again.");
        setTimeout(() => window.location.href = '/auth', 500);
        return false;
      }
      
      if (!refreshData.session) {
        console.error("Refresh succeeded but no session returned");
        toast.error("Session error. Please login again.");
        setTimeout(() => window.location.href = '/auth', 500);
        return false;
      }
      
      console.log("Session refreshed successfully");
      return true;
    } catch (refreshError) {
      console.error("Error refreshing token:", refreshError);
      // Continue with existing token as a fallback
      return true;
    }
  } catch (error: any) {
    console.error("Error in authentication check:", error);
    toast.error("Authentication error: " + (error?.message || "Unknown error"));
    setTimeout(() => window.location.href = '/auth', 500);
    return false;
  }
};
