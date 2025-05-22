
import { supabase } from "@/integrations/supabase/client";

/**
 * Get system statistics
 */
export const getSystemStats = async () => {
  try {
    const { data, error } = await supabase
      .from('system_stats')
      .select('*')
      .limit(1)
      .single();
      
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching system stats:', err);
    throw err;
  }
};
