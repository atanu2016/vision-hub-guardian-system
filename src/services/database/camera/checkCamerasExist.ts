
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if there are any cameras in the database
 * @returns boolean indicating if any cameras exist
 */
export async function checkCamerasExist(): Promise<boolean> {
  try {
    const { count, error } = await supabase
      .from('cameras')
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.error("Error checking camera existence:", error);
      return false;
    }
    
    return count ? count > 0 : false;
  } catch (error) {
    console.error("Exception checking camera existence:", error);
    return false;
  }
}

/**
 * Gets the total number of cameras in the system
 */
export async function getCameraCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('cameras')
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.error("Error counting cameras:", error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error("Exception counting cameras:", error);
    return 0;
  }
}
