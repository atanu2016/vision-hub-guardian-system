
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Ultra-fast authentication check with minimal overhead
 * @returns true if authenticated, false otherwise
 */
export const checkAuthentication = async (): Promise<boolean> => {
  try {
    // Use a cached session check to minimize overhead
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Authentication error:", error);
      toast.error("Please log in again");
      
      // If we have a session error, redirect to auth page
      window.location.href = '/auth';
      return false;
    }
    
    // Simple existence check - maximum performance
    return !!data.session;
  } catch (error: any) {
    console.error("Error in authentication check:", error);
    toast.error("Authentication error");
    
    return false;
  }
};

/**
 * Optimized database connection verification
 */
export const verifyDatabaseConnection = async (): Promise<boolean> => {
  try {
    // Try a simple query as a connectivity test
    // Use a COUNT query instead of fetching actual rows for maximum performance
    const { error } = await supabase
      .from('cameras')
      .select('id', { count: 'exact', head: true });
    
    return !error;
  } catch (error) {
    console.error("Failed to verify database connection:", error);
    return false;
  }
};
