
import { supabase } from "@/integrations/supabase/client";
import { Camera } from "@/types/camera";
import { logDatabaseError } from "./baseService";

// System stats operations
export const updateSystemStats = async (cameras: Camera[]) => {
  try {
    const totalCameras = cameras.length;
    const onlineCameras = cameras.filter(c => c.status === 'online').length;
    const offlineCameras = cameras.filter(c => c.status === 'offline').length;
    const recordingCameras = cameras.filter(c => c.recording).length;
    
    const stats = {
      total_cameras: totalCameras,
      online_cameras: onlineCameras,
      offline_cameras: offlineCameras,
      recording_cameras: recordingCameras,
      uptime_hours: 0, // This would normally come from a backend system
      storage_used: "0 GB",
      storage_total: "1 TB",
      storage_percentage: 0,
      last_updated: new Date().toISOString()
    };
    
    // Check if stats exist
    const { data: existingData } = await supabase
      .from('system_stats')
      .select('id')
      .limit(1);
      
    let query;
    if (existingData && existingData.length > 0) {
      // Update existing stats
      query = supabase
        .from('system_stats')
        .update(stats)
        .eq('id', existingData[0].id);
    } else {
      // Insert new stats
      query = supabase
        .from('system_stats')
        .insert(stats);
    }
    
    const { error } = await query;
    
    if (error) {
      console.error("Error updating system stats:", error);
      throw error;
    }
  } catch (error) {
    throw logDatabaseError(error, "Failed to update system stats");
  }
};

export const fetchSystemStatsFromDB = async () => {
  try {
    const { data, error } = await supabase
      .from('system_stats')
      .select('*')
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No data found, return default stats
        return {
          totalCameras: 0,
          onlineCameras: 0,
          offlineCameras: 0,
          recordingCameras: 0,
          uptimeHours: 0,
          storageUsed: "0 GB",
          storageTotal: "1 TB",
          storagePercentage: 0
        };
      }
      console.error("Error fetching system stats:", error);
      throw error;
    }
    
    return {
      totalCameras: data.total_cameras,
      onlineCameras: data.online_cameras,
      offlineCameras: data.offline_cameras,
      recordingCameras: data.recording_cameras,
      uptimeHours: data.uptime_hours,
      storageUsed: data.storage_used,
      storageTotal: data.storage_total,
      storagePercentage: data.storage_percentage
    };
  } catch (error) {
    throw logDatabaseError(error, "Failed to fetch system stats");
  }
};
