
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Log database errors with optional UI toast
export const logDatabaseError = (error: any, message: string, showToast = true) => {
  console.error(`Database service error: ${message}`, error);
  if (showToast) {
    toast("Error", {
      description: message
    });
  }
  return error;
};

// Check if database tables exist
export const checkDatabaseSetup = async (): Promise<boolean> => {
  try {
    // Try to query the cameras table
    const { error } = await supabase
      .from('cameras')
      .select('id')
      .limit(1);
      
    // If we get a PGRST109 error, the table doesn't exist
    if (error && error.code === 'PGRST109') {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error checking database setup:", error);
    return false;
  }
};
