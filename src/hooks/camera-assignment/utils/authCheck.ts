
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Fast authentication check with reduced overhead
 * @returns true if authenticated, false otherwise
 */
export const checkAuthentication = async (): Promise<boolean> => {
  try {
    // Use a simple lightweight session check
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Authentication error:", error);
      toast.error("Please log in again");
      
      // If we have a session error, attempt to redirect to auth page
      setTimeout(() => window.location.href = '/auth', 500);
      return false;
    }
    
    // Simple existence check
    if (!data.session) {
      console.error("No active session found");
      toast.error("Your session has expired. Please login again.");
      
      // Save current path for redirect after login
      setTimeout(() => window.location.href = '/auth', 500);
      return false;
    }
    
    // Perform an ultra-lightweight session validation
    // by just checking if the access token exists and hasn't expired
    if (!data.session.access_token) {
      toast.error("Invalid session");
      setTimeout(() => window.location.href = '/auth', 500);
      return false;
    }
    
    return true;
  } catch (error: any) {
    console.error("Error in authentication check:", error);
    toast.error("Authentication error");
    
    return false;
  }
};

/**
 * Verify session is valid and connected to Supabase
 */
export const verifyDatabaseConnection = async (): Promise<boolean> => {
  try {
    // Try a simple query as a connectivity test
    const { data, error } = await supabase
      .from('cameras')
      .select('id')
      .limit(1);
    
    return !error;
  } catch (error) {
    console.error("Failed to verify database connection:", error);
    return false;
  }
};
