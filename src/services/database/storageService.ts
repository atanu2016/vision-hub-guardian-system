
import { supabase } from "@/integrations/supabase/client";
import { StorageSettings } from "@/types/camera";
import { logDatabaseError } from "./baseService";

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
    throw logDatabaseError(error, "Failed to load storage settings");
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
    throw logDatabaseError(error, "Failed to save storage settings");
  }
};
