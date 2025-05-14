import { supabase } from "@/integrations/supabase/client";
import { Camera, CameraGroup, StorageSettings } from "@/types/camera";
import { toast } from "sonner";

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

// Recording settings operations
export const fetchRecordingSettingsFromDB = async () => {
  try {
    const { data, error } = await supabase
      .from('recording_settings')
      .select('*')
      .limit(1)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No data found, insert default settings
        const defaultSettings = {
          continuous: true,
          motion_detection: true,
          schedule_type: "always",
          time_start: "00:00",
          time_end: "23:59",
          days_of_week: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
          quality: "medium"
        };
        
        const { data: newData, error: insertError } = await supabase
          .from('recording_settings')
          .insert(defaultSettings)
          .select()
          .single();
          
        if (insertError) throw insertError;
        return {
          continuous: newData.continuous,
          motionDetection: newData.motion_detection,
          schedule: newData.schedule_type,
          timeStart: newData.time_start,
          timeEnd: newData.time_end,
          daysOfWeek: newData.days_of_week,
          quality: newData.quality
        };
      }
      
      console.error("Error fetching recording settings:", error);
      throw error;
    }
    
    return {
      continuous: data.continuous,
      motionDetection: data.motion_detection,
      schedule: data.schedule_type,
      timeStart: data.time_start,
      timeEnd: data.time_end,
      daysOfWeek: data.days_of_week,
      quality: data.quality
    };
  } catch (error) {
    console.error("Database service error:", error);
    toast("Error", {
      description: "Failed to load recording settings"
    });
    
    // Return default settings on error
    return {
      continuous: true,
      motionDetection: true,
      schedule: "always", 
      timeStart: "00:00",
      timeEnd: "23:59",
      daysOfWeek: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
      quality: "medium"
    };
  }
};

export const saveRecordingSettingsToDB = async (settings: any) => {
  try {
    // Transform to DB format
    const dbSettings = {
      continuous: settings.continuous,
      motion_detection: settings.motionDetection,
      schedule_type: settings.schedule,
      time_start: settings.timeStart,
      time_end: settings.timeEnd,
      days_of_week: settings.daysOfWeek,
      quality: settings.quality
    };
    
    // Check for existing settings
    const { data: existingData } = await supabase
      .from('recording_settings')
      .select('id')
      .limit(1);
      
    let query;
    if (existingData && existingData.length > 0) {
      // Update existing
      query = supabase
        .from('recording_settings')
        .update(dbSettings)
        .eq('id', existingData[0].id);
    } else {
      // Insert new
      query = supabase
        .from('recording_settings')
        .insert(dbSettings);
    }
    
    const { error } = await query;
    
    if (error) {
      console.error("Error saving recording settings:", error);
      throw error;
    }
    
    toast("Success", {
      description: "Recording settings saved successfully"
    });
    
    return true;
  } catch (error) {
    console.error("Database service error:", error);
    toast("Error", {
      description: "Failed to save recording settings"
    });
    return false;
  }
};

// Camera recording status operations
export const saveCameraRecordingStatus = async (cameraId: string, enabled: boolean): Promise<boolean> => {
  try {
    const { data: existing } = await supabase
      .from('camera_recording_status')
      .select()
      .eq('camera_id', cameraId)
      .maybeSingle();
      
    if (existing) {
      // Update
      const { error } = await supabase
        .from('camera_recording_status')
        .update({ enabled })
        .eq('camera_id', cameraId);
        
      if (error) throw error;
    } else {
      // Insert
      const { error } = await supabase
        .from('camera_recording_status')
        .insert({ camera_id: cameraId, enabled });
        
      if (error) throw error;
    }

    // Also update the recording flag in the cameras table for UI consistency
    const { error: cameraUpdateError } = await supabase
      .from('cameras')
      .update({ recording: enabled })
      .eq('id', cameraId);
      
    if (cameraUpdateError) {
      console.error("Error updating camera recording status:", cameraUpdateError);
    }
    
    return true;
  } catch (error) {
    console.error("Error saving camera recording status:", error);
    return false;
  }
};

// Alert settings operations
export const fetchAlertSettingsFromDB = async () => {
  try {
    const { data, error } = await supabase
      .from('alert_settings')
      .select('*')
      .limit(1)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No data found, insert default settings
        const defaultSettings = {
          motion_detection: true,
          camera_offline: true,
          storage_warning: true,
          email_notifications: false,
          push_notifications: false,
          email_address: "",
          notification_sound: "default"
        };
        
        const { data: newData, error: insertError } = await supabase
          .from('alert_settings')
          .insert(defaultSettings)
          .select()
          .single();
          
        if (insertError) throw insertError;
        return {
          motionDetection: newData.motion_detection,
          cameraOffline: newData.camera_offline,
          storageWarning: newData.storage_warning,
          emailNotifications: newData.email_notifications,
          pushNotifications: newData.push_notifications,
          emailAddress: newData.email_address,
          notificationSound: newData.notification_sound
        };
      }
      
      console.error("Error fetching alert settings:", error);
      throw error;
    }
    
    return {
      motionDetection: data.motion_detection,
      cameraOffline: data.camera_offline,
      storageWarning: data.storage_warning,
      emailNotifications: data.email_notifications,
      pushNotifications: data.push_notifications,
      emailAddress: data.email_address,
      notificationSound: data.notification_sound
    };
  } catch (error) {
    console.error("Database service error:", error);
    toast("Error", {
      description: "Failed to load alert settings"
    });
    
    // Return default settings on error
    return {
      motionDetection: true,
      cameraOffline: true,
      storageWarning: true,
      emailNotifications: false,
      pushNotifications: false,
      emailAddress: "",
      notificationSound: "default"
    };
  }
};

export const saveAlertSettingsToDB = async (settings: any) => {
  try {
    // Transform to DB format
    const dbSettings = {
      motion_detection: settings.motionDetection,
      camera_offline: settings.cameraOffline,
      storage_warning: settings.storageWarning,
      email_notifications: settings.emailNotifications,
      push_notifications: settings.pushNotifications,
      email_address: settings.emailAddress,
      notification_sound: settings.notificationSound
    };
    
    // Check for existing settings
    const { data: existingData } = await supabase
      .from('alert_settings')
      .select('id')
      .limit(1);
      
    let query;
    if (existingData && existingData.length > 0) {
      // Update existing
      query = supabase
        .from('alert_settings')
        .update(dbSettings)
        .eq('id', existingData[0].id);
    } else {
      // Insert new
      query = supabase
        .from('alert_settings')
        .insert(dbSettings);
    }
    
    const { error } = await query;
    
    if (error) {
      console.error("Error saving alert settings:", error);
      throw error;
    }
    
    toast("Success", {
      description: "Alert settings saved successfully"
    });
    
    return true;
  } catch (error) {
    console.error("Database service error:", error);
    toast("Error", {
      description: "Failed to save alert settings"
    });
    return false;
  }
};

// Webhook operations
export const fetchWebhooksFromDB = async () => {
  try {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .order('created_at');
      
    if (error) {
      console.error("Error fetching webhooks:", error);
      throw error;
    }
    
    // Transform to our format
    return data.map(webhook => ({
      id: webhook.id,
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      active: webhook.active
    }));
  } catch (error) {
    console.error("Database service error:", error);
    toast("Error", {
      description: "Failed to load webhooks"
    });
    return [];
  }
};

export const saveWebhookToDB = async (webhook: any) => {
  try {
    const { id, ...webhookData } = webhook;
    
    if (id) {
      // Update
      const { error } = await supabase
        .from('webhooks')
        .update({
          name: webhookData.name,
          url: webhookData.url,
          events: webhookData.events,
          active: webhookData.active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
    } else {
      // Insert
      const { error } = await supabase
        .from('webhooks')
        .insert({
          name: webhookData.name,
          url: webhookData.url,
          events: webhookData.events,
          active: webhookData.active
        });
        
      if (error) throw error;
    }
    
    toast("Success", {
      description: "Webhook saved successfully"
    });
    
    return true;
  } catch (error) {
    console.error("Error saving webhook:", error);
    toast("Error", {
      description: "Failed to save webhook"
    });
    return false;
  }
};

export const deleteWebhookFromDB = async (id: string) => {
  try {
    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    toast("Success", {
      description: "Webhook deleted successfully"
    });
    
    return true;
  } catch (error) {
    console.error("Error deleting webhook:", error);
    toast("Error", {
      description: "Failed to delete webhook"
    });
    return false;
  }
};

// Advanced settings operations
export const fetchAdvancedSettingsFromDB = async () => {
  try {
    const { data, error } = await supabase
      .from('advanced_settings')
      .select('*')
      .limit(1)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No data found, insert default settings
        const defaultSettings = {
          server_port: '8080',
          log_level: 'info',
          debug_mode: false,
          mfa_enabled: false,
          log_retention_days: 30,
          min_log_level: 'info'
        };
        
        const { data: newData, error: insertError } = await supabase
          .from('advanced_settings')
          .insert(defaultSettings)
          .select()
          .single();
          
        if (insertError) throw insertError;
        return {
          serverPort: newData.server_port,
          logLevel: newData.log_level,
          debugMode: newData.debug_mode,
          mfaEnabled: newData.mfa_enabled,
          mfaSecret: newData.mfa_secret,
          logRetentionDays: newData.log_retention_days,
          minLogLevel: newData.min_log_level
        };
      }
      
      console.error("Error fetching advanced settings:", error);
      throw error;
    }
    
    return {
      serverPort: data.server_port,
      logLevel: data.log_level,
      debugMode: data.debug_mode,
      mfaEnabled: data.mfa_enabled,
      mfaSecret: data.mfa_secret,
      logRetentionDays: data.log_retention_days,
      minLogLevel: data.min_log_level
    };
  } catch (error) {
    console.error("Database service error:", error);
    toast("Error", {
      description: "Failed to load advanced settings"
    });
    
    // Return default settings on error
    return {
      serverPort: '8080',
      logLevel: 'info',
      debugMode: false,
      mfaEnabled: false,
      mfaSecret: '',
      logRetentionDays: 30,
      minLogLevel: 'info'
    };
  }
};

export const saveAdvancedSettingsToDB = async (settings: any) => {
  try {
    // Transform to DB format
    const dbSettings = {
      server_port: settings.serverPort,
      log_level: settings.logLevel,
      debug_mode: settings.debugMode,
      mfa_enabled: settings.mfaEnabled,
      mfa_secret: settings.mfaSecret,
      log_retention_days: settings.logRetentionDays,
      min_log_level: settings.minLogLevel
    };
    
    // Check for existing settings
    const { data: existingData } = await supabase
      .from('advanced_settings')
      .select('id')
      .limit(1);
      
    let query;
    if (existingData && existingData.length > 0) {
      // Update existing
      query = supabase
        .from('advanced_settings')
        .update(dbSettings)
        .eq('id', existingData[0].id);
    } else {
      // Insert new
      query = supabase
        .from('advanced_settings')
        .insert(dbSettings);
    }
    
    const { error } = await query;
    
    if (error) {
      console.error("Error saving advanced settings:", error);
      throw error;
    }
    
    toast("Success", {
      description: "Advanced settings saved successfully"
    });
    
    return true;
  } catch (error) {
    console.error("Database service error:", error);
    toast("Error", {
      description: "Failed to save advanced settings"
    });
    return false;
  }
};

// System logs operations
export const fetchLogsFromDB = async (filters: { level?: string; source?: string; search?: string } = {}) => {
  try {
    let query = supabase
      .from('system_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);
      
    // Apply any filters
    if (filters.level && filters.level !== 'all') {
      query = query.eq('level', filters.level);
    }
    
    if (filters.source && filters.source !== 'all') {
      query = query.eq('source', filters.source);
    }
    
    if (filters.search) {
      query = query.or(`message.ilike.%${filters.search}%,details.ilike.%${filters.search}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching logs:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Database service error:", error);
    toast("Error", {
      description: "Failed to load system logs"
    });
    return [];
  }
};

export const addLogToDB = async (level: string, message: string, source: string, details?: string) => {
  try {
    const { error } = await supabase
      .from('system_logs')
      .insert({
        level,
        message,
        source,
        details,
        timestamp: new Date().toISOString()
      });
      
    if (error) {
      console.error("Error adding log:", error);
    }
  } catch (error) {
    console.error("Error adding log to database:", error);
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
    
    toast("Example camera feeds have been added to your database");
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
