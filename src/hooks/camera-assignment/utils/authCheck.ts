
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
    
    if (sessionError || !sessionData.session) {
      console.error("Authentication error:", sessionError || "No active session");
      toast.error("Authentication required. Please log in again.");
      
      // Redirect to auth page after brief delay
      setTimeout(() => {
        window.location.href = '/auth';
      }, 1000);
      
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in authentication check:", error);
    return false;
  }
};
