
import { supabase } from "@/integrations/supabase/client";
import { StorageSettings } from "@/types/camera";
import { logDatabaseError } from "./baseService";

// Fetch storage settings from database
export const fetchStorageSettingsFromDB = async (): Promise<StorageSettings> => {
  try {
    const { data, error } = await supabase
      .from('storage_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    if (error) {
      console.error("Error fetching storage settings:", error);
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
    
    // Transform database keys to match our interface
    return {
      type: data.type as 'local' | 'nas' | 's3' | 'dropbox' | 'google_drive' | 'onedrive' | 'azure_blob' | 'backblaze',
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
  } catch (error) {
    throw logDatabaseError(error, "Failed to fetch storage settings");
  }
};

// Save storage settings to database
export const saveStorageSettingsToDB = async (settings: StorageSettings): Promise<StorageSettings> => {
  try {
    // Convert settings to database format
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
    
    const { data, error } = await supabase
      .from('storage_settings')
      .upsert(dbSettings)
      .select()
      .single();
      
    if (error) {
      console.error("Error saving storage settings:", error);
      throw error;
    }
    
    // Return the updated settings
    return settings;
  } catch (error) {
    throw logDatabaseError(error, "Failed to save storage settings");
  }
};

// Add additional storage-related functions below
