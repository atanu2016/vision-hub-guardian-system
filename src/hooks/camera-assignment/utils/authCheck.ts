
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Fast authentication check with reduced overhead
 * @returns true if authenticated, false otherwise
 */
export const checkAuthentication = async (): Promise<boolean> => {
  try {
    // Simplified session check with less overhead
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Authentication error:", error);
      toast.error("Please log in again");
      
      // If we have a session error, attempt to redirect to auth page
      setTimeout(() => window.location.href = '/auth', 500);
      return false;
    }
    
    // Check if session exists and is not expired
    if (!data.session) {
      console.error("No active session found");
      toast.error("Your session has expired. Please login again.");
      
      // Save current path for redirect after login
      setTimeout(() => window.location.href = '/auth', 500);
      return false;
    }
    
    // Quick validation check - verify session is not expired
    const expiresAt = data.session.expires_at;
    const currentTime = Math.floor(Date.now() / 1000);
    
    // If session is about to expire, try to refresh it silently
    if (expiresAt - currentTime < 300) { // less than 5 minutes left
      console.log("Session about to expire, refreshing token");
      
      // Don't await this - let it happen in background
      supabase.auth.refreshSession().catch(err => 
        console.warn("Background refresh failed:", err)
      );
    }
    
    return true;
  } catch (error: any) {
    console.error("Error in authentication check:", error);
    toast.error("Authentication error");
    
    // Don't redirect immediately, but prompt the user to try again
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
    
    if (error) {
      console.error("Database connectivity error:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Failed to verify database connection:", error);
    return false;
  }
};
