
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
      
      // Use a non-blocking approach to redirect
      toast.error("Authentication required. Please log in again.", {
        onDismiss: () => {
          window.location.href = '/auth';
        }
      });
      
      return false;
    }
    
    return true;
  } catch (error: any) {
    console.error("Error in authentication check:", error);
    toast.error("Authentication error: " + (error?.message || "Unknown error"));
    return false;
  }
};
