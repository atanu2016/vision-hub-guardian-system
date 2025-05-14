
import { supabase } from "@/integrations/supabase/client";
import { Camera, CameraGroup, StorageSettings } from "@/types/camera";
import { toast } from "@/hooks/use-toast";

// Camera operations
export const fetchCamerasFromDB = async (): Promise<Camera[]> => {
  try {
    const { data, error } = await supabase
      .from('cameras')
      .select('*')
      .order('name');
    
    if (error) {
      console.error("Error fetching cameras:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Database service error:", error);
    throw error;
  }
};

export const saveCameraToDB = async (camera: Camera): Promise<Camera> => {
  try {
    // Handle both insert and update cases
    if (camera.id && camera.id.startsWith('cam-')) {
      // Generated ID, replace with a UUID
      delete camera.id;
    }

    let query;
    if (camera.id) {
      // Update existing camera
      query = supabase
        .from('cameras')
        .update({
          name: camera.name,
          status: camera.status,
          location: camera.location, 
          ipAddress: camera.ipAddress,
          port: camera.port,
          username: camera.username,
          password: camera.password,
          model: camera.model,
          manufacturer: camera.manufacturer,
          lastSeen: new Date().toISOString(),
          recording: camera.recording,
          thumbnail: camera.thumbnail,
          group: camera.group,
          connectionType: camera.connectionType,
          rtmpUrl: camera.rtmpUrl,
          onvifPath: camera.onvifPath,
          motionDetection: camera.motionDetection
        })
        .eq('id', camera.id)
        .select()
        .single();
    } else {
      // Insert new camera
      query = supabase
        .from('cameras')
        .insert({
          ...camera,
          lastSeen: new Date().toISOString()
        })
        .select()
        .single();
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error saving camera:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Database service error:", error);
    throw error;
  }
};

export const deleteCameraFromDB = async (cameraId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('cameras')
      .delete()
      .eq('id', cameraId);
    
    if (error) {
      console.error("Error deleting camera:", error);
      throw error;
    }
  } catch (error) {
    console.error("Database service error:", error);
    throw error;
  }
};

// Storage settings operations
export const fetchStorageSettingsFromDB = async (): Promise<StorageSettings> => {
  try {
    const { data, error } = await supabase
      .from('storage_settings')
      .select('*')
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No data found, return default settings
        return {
          type: 'local',
          path: '/recordings',
          retentionDays: 30,
          overwriteOldest: true
        };
      }
      console.error("Error fetching storage settings:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Database service error:", error);
    throw error;
  }
};

export const saveStorageSettingsToDB = async (settings: StorageSettings): Promise<StorageSettings> => {
  try {
    // First check if we have any settings
    const { data: existingData } = await supabase
      .from('storage_settings')
      .select('id')
      .limit(1);
    
    let query;
    if (existingData && existingData.length > 0) {
      // Update existing settings
      query = supabase
        .from('storage_settings')
        .update(settings)
        .eq('id', existingData[0].id)
        .select()
        .single();
    } else {
      // Insert new settings
      query = supabase
        .from('storage_settings')
        .insert(settings)
        .select()
        .single();
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error saving storage settings:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Database service error:", error);
    throw error;
  }
};

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
    console.error("Database service error:", error);
    throw error;
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
          total_cameras: 0,
          online_cameras: 0,
          offline_cameras: 0,
          recording_cameras: 0,
          uptime_hours: 0,
          storage_used: "0 GB",
          storage_total: "1 TB",
          storage_percentage: 0
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
    console.error("Database service error:", error);
    throw error;
  }
};

// Sync cameras from public feeds to database if none exist
export const syncPublicCamerasToDatabase = async (publicCameras: Camera[]): Promise<void> => {
  try {
    // First check if we have any cameras
    const { data: existingCameras, error: checkError } = await supabase
      .from('cameras')
      .select('id')
      .limit(1);
      
    if (checkError) {
      console.error("Error checking for existing cameras:", checkError);
      throw checkError;
    }
    
    // If we have cameras, don't sync
    if (existingCameras && existingCameras.length > 0) {
      return;
    }
    
    // Prepare cameras for insert (remove any existing IDs)
    const camerasToInsert = publicCameras.map(({id, ...rest}) => ({
      ...rest,
      lastSeen: new Date().toISOString()
    }));
    
    // Insert cameras
    const { error: insertError } = await supabase
      .from('cameras')
      .insert(camerasToInsert);
      
    if (insertError) {
      console.error("Error syncing public cameras:", insertError);
      throw insertError;
    }
    
    toast({
      title: "Public camera feeds imported",
      description: "Example camera feeds have been added to your database"
    });
  } catch (error) {
    console.error("Database service error:", error);
    throw error;
  }
};

// Helper to check if database tables exist
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
