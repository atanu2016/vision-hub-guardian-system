
import { supabase } from "@/integrations/supabase/client";
import { logDatabaseError } from "./baseService";

// Fetch system stats from database
export const fetchSystemStatsFromDB = async () => {
  try {
    const { data, error } = await supabase
      .from('system_stats')
      .select('*')
      .limit(1)
      .maybeSingle();
      
    if (error) {
      console.error("Error fetching system stats:", error);
      throw error;
    }
    
    // If no stats exist, return default stats
    if (!data) {
      return {
        id: 'default',
        last_updated: new Date().toISOString(),
        online_cameras: 0,
        offline_cameras: 0,
        total_cameras: 0,
        recording_cameras: 0,
        storage_used: '0 GB',
        storage_total: '1 TB',
        storage_percentage: 0,
        uptime_hours: 0
      };
    }
    
    return data;
  } catch (error) {
    throw logDatabaseError(error, "Failed to fetch system stats");
  }
};

// Initialize database setup - rename to avoid conflict with baseService
export const initializeSystemStats = async () => {
  try {
    // Check if the database tables exist
    const { data, error } = await supabase
      .from('system_stats')
      .select('id')
      .limit(1);
      
    if (error && error.code !== 'PGRST116') {
      console.error("Error checking database setup:", error);
      throw error;
    }
    
    // If no stats exist, create initial stats
    if (!data || data.length === 0) {
      const { error: insertError } = await supabase
        .from('system_stats')
        .insert({
          id: 'system',
          last_updated: new Date().toISOString(),
          online_cameras: 0,
          offline_cameras: 0,
          total_cameras: 0,
          recording_cameras: 0,
          storage_used: '0 GB',
          storage_total: '1 TB',
          storage_percentage: 0,
          uptime_hours: 0
        });
        
      if (insertError) {
        console.error("Error initializing system stats:", insertError);
        throw insertError;
      }
    }
    
    return true;
  } catch (error) {
    throw logDatabaseError(error, "Failed to check database setup");
  }
};

// Update system stats
export const updateSystemStats = async (stats: Partial<{
  online_cameras: number;
  offline_cameras: number;
  total_cameras: number;
  recording_cameras: number;
  storage_used: string;
  storage_total: string;
  storage_percentage: number;
  uptime_hours: number;
}>) => {
  try {
    const { error } = await supabase
      .from('system_stats')
      .update({
        ...stats,
        last_updated: new Date().toISOString()
      })
      .eq('id', 'system');
      
    if (error) {
      console.error("Error updating system stats:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    throw logDatabaseError(error, "Failed to update system stats");
  }
};
