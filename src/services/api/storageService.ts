
import { supabase } from "@/integrations/supabase/client";
import { StorageSettings } from "@/types/camera";

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
    // Cast the type to ensure it matches the expected enum values
    const storageType = data.type as 'local' | 'nas' | 's3' | 'dropbox' | 'google_drive' | 'onedrive' | 'azure_blob' | 'backblaze';
    
    return {
      type: storageType,
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
      // Add fallbacks for all optional properties
      dropboxToken: data.dropboxtoken || undefined,
      dropboxFolder: data.dropboxfolder || undefined,
      googleDriveToken: data.googledrivertoken || undefined,
      googleDriveFolderId: data.googledrivefolderid || undefined,
      oneDriveToken: data.onedrivetoken || undefined,
      oneDriveFolderId: data.onedrivefolderid || undefined,
      azureConnectionString: data.azureconnectionstring || undefined,
      azureContainer: data.azurecontainer || undefined,
      backblazeKeyId: data.backblazekeyid || undefined,
      backblazeApplicationKey: data.backblazeapplicationkey || undefined,
      backblazeBucket: data.backblazebucket || undefined
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
