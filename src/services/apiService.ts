
import { StorageSettings } from "@/types/camera";
import { supabase } from "@/integrations/supabase/client";

// Function to get storage settings
export const getStorageSettings = async (): Promise<StorageSettings> => {
  try {
    const { data, error } = await supabase
      .from('storage_settings')
      .select('*')
      .maybeSingle();
    
    if (error) throw error;
    
    // Transform from DB format to our application format
    return {
      type: data?.type || 'local',
      path: data?.path || '/recordings',
      retentionDays: data?.retentiondays || 30,
      overwriteOldest: data?.overwriteoldest || true,
      nasAddress: data?.nasaddress,
      nasPath: data?.naspath,
      nasUsername: data?.nasusername,
      nasPassword: data?.naspassword,
      s3Endpoint: data?.s3endpoint,
      s3Bucket: data?.s3bucket,
      s3AccessKey: data?.s3accesskey,
      s3SecretKey: data?.s3secretkey,
      s3Region: data?.s3region
    };
  } catch (error) {
    console.error("Failed to load storage settings:", error);
    // Return default settings on error
    return {
      type: 'local',
      path: '/recordings',
      retentionDays: 30,
      overwriteOldest: true
    };
  }
};

// Function to save storage settings
export const saveStorageSettings = async (settings: StorageSettings): Promise<boolean> => {
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
    
    // Check if we have an existing record
    const { data: existingData } = await supabase
      .from('storage_settings')
      .select('id')
      .limit(1);
    
    if (existingData && existingData.length > 0) {
      // Update existing record
      const { error } = await supabase
        .from('storage_settings')
        .update(dbSettings)
        .eq('id', existingData[0].id);
      
      if (error) throw error;
    } else {
      // Insert new record
      const { error } = await supabase
        .from('storage_settings')
        .insert(dbSettings);
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Failed to save storage settings:", error);
    return false;
  }
};

// Function to validate storage access
export const validateStorageAccess = async (settings: StorageSettings): Promise<boolean> => {
  // In a real implementation, this would validate connectivity to the storage
  // For now, we'll just return true if all required fields are provided
  switch (settings.type) {
    case 'local':
      return !!settings.path;
    case 'nas':
      return !!(settings.nasAddress && settings.nasPath);
    case 's3':
      return !!(settings.s3Endpoint && settings.s3Bucket && 
                settings.s3AccessKey && settings.s3SecretKey);
    case 'dropbox':
      return !!settings.dropboxToken;
    case 'google_drive':
      return !!settings.googleDriveToken;
    case 'onedrive':
      return !!settings.oneDriveToken;
    case 'azure_blob':
      return !!(settings.azureConnectionString && settings.azureContainer);
    case 'backblaze':
      return !!(settings.backblazeKeyId && settings.backblazeApplicationKey && 
                settings.backblazeBucket);
    default:
      return false;
  }
};
