
// Import necessary dependencies
import { Camera, StorageSettings } from "@/types/camera";
import { supabase } from "@/integrations/supabase/client";

// Re-export camera service functions
export { saveCamera, getCameras, deleteCamera, setupCameraStream } from './api/cameraService';

/**
 * Get storage settings from the database
 * @returns Promise resolving to storage settings
 */
export const getStorageSettings = async (): Promise<StorageSettings> => {
  try {
    const { data, error } = await supabase
      .from('storage_settings')
      .select('*')
      .limit(1)
      .single();
      
    if (error) {
      console.error('Error fetching storage settings:', error);
      // Return default settings if there's an error
      return {
        type: 'local',
        path: '/recordings',
        retentiondays: 30,
        overwriteoldest: true
      };
    }
    
    return data as StorageSettings;
  } catch (error) {
    console.error('Error fetching storage settings:', error);
    // Return default settings if there's an exception
    return {
      type: 'local',
      path: '/recordings',
      retentiondays: 30,
      overwriteoldest: true
    };
  }
};

/**
 * Save storage settings to the database
 * @param settings Storage settings to save
 * @returns Promise resolving to boolean indicating success
 */
export const saveStorageSettings = async (settings: StorageSettings): Promise<boolean> => {
  try {
    // Check if settings already exist
    const { data: existingSettings, error: checkError } = await supabase
      .from('storage_settings')
      .select('id')
      .limit(1)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking storage settings:', checkError);
      return false;
    }
    
    if (existingSettings) {
      // Update existing settings
      const { error } = await supabase
        .from('storage_settings')
        .update(settings)
        .eq('id', existingSettings.id);
        
      if (error) {
        console.error('Error updating storage settings:', error);
        return false;
      }
    } else {
      // Insert new settings with a generated ID
      const { error } = await supabase
        .from('storage_settings')
        .insert({
          ...settings,
          id: crypto.randomUUID()
        });
        
      if (error) {
        console.error('Error inserting storage settings:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error saving storage settings:', error);
    return false;
  }
};
