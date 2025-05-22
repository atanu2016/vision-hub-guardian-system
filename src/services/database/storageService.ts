
import { supabase } from "@/integrations/supabase/client";
import { logDatabaseError } from "./baseService";

// Fetch storage settings from database
export const fetchStorageSettingsFromDB = async () => {
  try {
    const { data, error } = await supabase
      .from('storage_settings')
      .select('*')
      .limit(1)
      .maybeSingle();
      
    if (error) {
      console.error("Error fetching storage settings:", error);
      throw error;
    }
    
    // If no settings exist, return default settings
    if (!data) {
      return {
        id: 'default',
        type: 'local',
        path: '/recordings',
        retentiondays: 30,
        overwriteoldest: true
      };
    }
    
    return data;
  } catch (error) {
    throw logDatabaseError(error, "Failed to fetch storage settings");
  }
};

// Save storage settings to database
export const saveStorageSettingsToDB = async (settings: any) => {
  try {
    // Check if settings exist
    const { data: existingSettings } = await supabase
      .from('storage_settings')
      .select('id')
      .limit(1)
      .maybeSingle();
    
    let result;
    
    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from('storage_settings')
        .update(settings)
        .eq('id', existingSettings.id)
        .select()
        .single();
        
      if (error) {
        console.error("Error updating storage settings:", error);
        throw error;
      }
      
      result = data;
    } else {
      // Insert new settings
      const { data, error } = await supabase
        .from('storage_settings')
        .insert(settings)
        .select()
        .single();
        
      if (error) {
        console.error("Error inserting storage settings:", error);
        throw error;
      }
      
      result = data;
    }
    
    return result;
  } catch (error) {
    throw logDatabaseError(error, "Failed to save storage settings");
  }
};
