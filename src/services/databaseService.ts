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
    
    // Transform the data to match our Camera type
    const cameras: Camera[] = data.map(cam => ({
      id: cam.id,
      name: cam.name,
      status: cam.status as "online" | "offline" | "error",
      location: cam.location,
      ipAddress: cam.ipaddress,
      port: cam.port || 80,
      username: cam.username || undefined,
      password: cam.password || undefined,
      model: cam.model || undefined,
      manufacturer: cam.manufacturer || undefined,
      lastSeen: cam.lastseen,
      recording: cam.recording || false,
      thumbnail: cam.thumbnail || undefined,
      group: cam.group || undefined,
      connectionType: (cam.connectiontype as "ip" | "rtsp" | "rtmp" | "onvif") || "ip",
      rtmpUrl: cam.rtmpurl || undefined,
      onvifPath: cam.onvifpath || undefined,
      motionDetection: cam.motiondetection || false
    }));
    
    return cameras;
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

    // Transform camera object to match database schema
    const dbCamera = {
      id: camera.id,
      name: camera.name,
      status: camera.status,
      location: camera.location, 
      ipaddress: camera.ipAddress,
      port: camera.port,
      username: camera.username,
      password: camera.password,
      model: camera.model,
      manufacturer: camera.manufacturer,
      lastseen: new Date().toISOString(),
      recording: camera.recording,
      thumbnail: camera.thumbnail,
      group: camera.group,
      connectiontype: camera.connectionType,
      rtmpurl: camera.rtmpUrl,
      onvifpath: camera.onvifPath,
      motiondetection: camera.motionDetection
    };

    let query;
    if (camera.id) {
      // Update existing camera
      query = supabase
        .from('cameras')
        .update(dbCamera)
        .eq('id', camera.id)
        .select()
        .single();
    } else {
      // Insert new camera
      query = supabase
        .from('cameras')
        .insert(dbCamera)
        .select()
        .single();
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error saving camera:", error);
      throw error;
    }
    
    // Transform back from DB format to our Camera type
    return {
      id: data.id,
      name: data.name,
      status: data.status as "online" | "offline" | "error",
      location: data.location,
      ipAddress: data.ipaddress,
      port: data.port || 80,
      username: data.username || undefined,
      password: data.password || undefined,
      model: data.model || undefined,
      manufacturer: data.manufacturer || undefined,
      lastSeen: data.lastseen,
      recording: data.recording || false,
      thumbnail: data.thumbnail || undefined,
      group: data.group || undefined,
      connectionType: (data.connectiontype as "ip" | "rtsp" | "rtmp" | "onvif") || "ip",
      rtmpUrl: data.rtmpurl || undefined,
      onvifPath: data.onvifpath || undefined,
      motionDetection: data.motiondetection || false
    };
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
    
    // Transform DB data to our StorageSettings type
    return {
      type: data.type as "local" | "nas" | "s3",
      path: data.path || undefined,
      retentionDays: data.retentiondays,
      overwriteOldest: data.overwriteoldest,
      nasAddress: data.nasaddress || undefined,
      nasPath: data.naspath || undefined,
      nasUsername: data.nasusername || undefined, 
      nasPassword: data.naspassword || undefined,
      s3Endpoint: data.s3endpoint || undefined,
      s3Bucket: data.s3bucket || undefined,
      s3AccessKey: data.s3accesskey || undefined,
      s3SecretKey: data.s3secretkey || undefined,
      s3Region: data.s3region || undefined
    };
  } catch (error) {
    console.error("Database service error:", error);
    throw error;
  }
};

export const saveStorageSettingsToDB = async (settings: StorageSettings): Promise<StorageSettings> => {
  try {
    // Transform to DB format
    const dbSettings = {
      type: settings.type,
      path: settings.path,
      retentiondays: settings.retentionDays,
      overwriteoldest: settings.overwriteOldest,
      nasaddress: settings.nasAddress,
      naspath: settings.nasPath,
      nasusername: settings.nasUsername,
      naspassword: settings.nasPassword,
      s3endpoint: settings.s3Endpoint,
      s3bucket: settings.s3Bucket,
      s3accesskey: settings.s3AccessKey,
      s3secretkey: settings.s3SecretKey,
      s3region: settings.s3Region
    };
    
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
        .update(dbSettings)
        .eq('id', existingData[0].id)
        .select()
        .single();
    } else {
      // Insert new settings
      query = supabase
        .from('storage_settings')
        .insert(dbSettings)
        .select()
        .single();
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error saving storage settings:", error);
      throw error;
    }
    
    // Transform back to our type
    return {
      type: data.type as "local" | "nas" | "s3",
      path: data.path || undefined,
      retentionDays: data.retentiondays,
      overwriteOldest: data.overwriteoldest,
      nasAddress: data.nasaddress || undefined,
      nasPath: data.naspath || undefined,
      nasUsername: data.nasusername || undefined, 
      nasPassword: data.naspassword || undefined,
      s3Endpoint: data.s3endpoint || undefined,
      s3Bucket: data.s3bucket || undefined,
      s3AccessKey: data.s3accesskey || undefined,
      s3SecretKey: data.s3secretkey || undefined,
      s3Region: data.s3region || undefined
    };
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
    
    // Prepare cameras for insert
    const camerasToInsert = publicCameras.map(({id, ...rest}) => ({
      name: rest.name,
      status: rest.status,
      location: rest.location,
      ipaddress: rest.ipAddress,
      port: rest.port,
      username: rest.username,
      password: rest.password,
      model: rest.model,
      manufacturer: rest.manufacturer,
      lastseen: new Date().toISOString(),
      recording: rest.recording,
      thumbnail: rest.thumbnail,
      group: rest.group,
      connectiontype: rest.connectionType,
      rtmpurl: rest.rtmpUrl,
      onvifpath: rest.onvifPath,
      motiondetection: rest.motionDetection
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
