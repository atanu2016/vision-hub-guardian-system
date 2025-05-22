
import { supabase } from "@/integrations/supabase/client";
import { Camera, StorageSettings } from "@/types/camera";
import { toDatabaseCamera } from "@/utils/cameraPropertyMapper";
import { fetchAlertSettingsFromDB, saveAlertSettingsToDB } from "@/services/database";

/**
 * Save camera to database
 * @param camera Camera object to save
 * @returns Promise resolving to the saved camera
 */
export const saveCamera = async (camera: Camera) => {
  try {
    const { data, error } = await supabase
      .from('cameras')
      .upsert(camera, { onConflict: 'id' })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error saving camera:', err);
    throw err;
  }
};

/**
 * Get all cameras from database
 * @returns Promise resolving to array of cameras
 */
export const getCameras = async (): Promise<Camera[]> => {
  try {
    const { data, error } = await supabase
      .from('cameras')
      .select('*');
      
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching cameras:', err);
    throw err;
  }
};

/**
 * Delete a camera from database
 * @param id Camera ID to delete
 * @returns Promise resolving when camera is deleted
 */
export const deleteCamera = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('cameras')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  } catch (err) {
    console.error('Error deleting camera:', err);
    throw err;
  }
};

/**
 * Get storage settings from database
 */
export const getStorageSettings = async (): Promise<StorageSettings> => {
  try {
    const { data, error } = await supabase
      .from('storage_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    // If no settings exist, return default settings
    if (!data) {
      return {
        type: 'local',
        path: '/recordings',
        retentionDays: 30,
        overwriteOldest: true
      };
    }
    
    // Translate database keys to interface format
    return {
      type: data.type,
      path: data.path,
      retentionDays: data.retentiondays,
      overwriteOldest: data.overwriteoldest,
      nasAddress: data.nasaddress,
      nasPath: data.naspath,
      nasUsername: data.nasusername,
      nasPassword: data.naspassword,
      s3Endpoint: data.s3endpoint,
      s3Bucket: data.s3bucket,
      s3AccessKey: data.s3accesskey,
      s3SecretKey: data.s3secretkey,
      s3Region: data.s3region,
      dropboxToken: data.dropboxtoken,
      dropboxFolder: data.dropboxfolder,
      googleDriveToken: data.googledrivertoken,
      googleDriveFolderId: data.googledrivefolderid,
      oneDriveToken: data.onedrivetoken,
      oneDriveFolderId: data.onedrivefolderid,
      azureConnectionString: data.azureconnectionstring,
      azureContainer: data.azurecontainer,
      backblazeKeyId: data.backblazekeyid,
      backblazeApplicationKey: data.backblazeapplicationkey,
      backblazeBucket: data.backblazebucket
    };
  } catch (err) {
    console.error('Error fetching storage settings:', err);
    throw err;
  }
};

/**
 * Save storage settings to database
 */
export const saveStorageSettings = async (settings: StorageSettings): Promise<boolean> => {
  try {
    // Convert to database format
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
      s3region: settings.s3Region,
      dropboxtoken: settings.dropboxToken,
      dropboxfolder: settings.dropboxFolder,
      googledrivertoken: settings.googleDriveToken,
      googledrivefolderid: settings.googleDriveFolderId,
      onedrivetoken: settings.oneDriveToken,
      onedrivefolderid: settings.oneDriveFolderId,
      azureconnectionstring: settings.azureConnectionString,
      azurecontainer: settings.azureContainer,
      backblazekeyid: settings.backblazeKeyId,
      backblazeapplicationkey: settings.backblazeApplicationKey,
      backblazebucket: settings.backblazeBucket
    };
    
    const { error } = await supabase
      .from('storage_settings')
      .upsert(dbSettings);
      
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error saving storage settings:', err);
    return false;
  }
};

/**
 * Get alert settings from database
 */
export const getAlertSettings = async () => {
  try {
    return await fetchAlertSettingsFromDB();
  } catch (err) {
    console.error('Error fetching alert settings:', err);
    // Return default settings if an error occurs
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

/**
 * Save alert settings to database
 */
export const saveAlertSettings = async (settings: any) => {
  try {
    return await saveAlertSettingsToDB(settings);
  } catch (err) {
    console.error('Error saving alert settings:', err);
    throw err;
  }
};

/**
 * Validate storage access
 */
export const validateStorageAccess = async (settings: StorageSettings): Promise<boolean> => {
  try {
    // In a real application, this would make an API call to check if storage is accessible
    // For demo purposes, we'll simulate with a delay and random success
    await new Promise(resolve => setTimeout(resolve, 1000));
    return Math.random() > 0.2; // 80% success rate for demo
  } catch (err) {
    console.error('Error validating storage:', err);
    return false;
  }
};

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

/**
 * Setup camera stream (implementation depends on your specific needs)
 */
export const setupCameraStream = (camera: Camera, videoElement: HTMLVideoElement, onError: (err: string) => void) => {
  // This is a simplified implementation for demo purposes
  console.log('Setting up stream for camera:', camera.id);
  
  // This should be replaced with actual implementation to set up the camera stream
  // Return cleanup function
  return () => {
    console.log('Cleaning up stream for camera:', camera.id);
  };
};

/**
 * Stream logs in real-time (simplified implementation)
 */
export const streamLogs = (callback: (log: any) => void) => {
  // Simulate real-time logs
  const interval = setInterval(() => {
    callback({
      id: Date.now().toString(),
      level: ['info', 'warn', 'error'][Math.floor(Math.random() * 3)],
      message: `Log entry at ${new Date().toISOString()}`,
      timestamp: new Date().toISOString(),
      source: 'system'
    });
  }, 5000);
  
  // Return cleanup function
  return () => clearInterval(interval);
};
