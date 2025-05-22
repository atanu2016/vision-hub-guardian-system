
import { supabase } from "@/integrations/supabase/client";
import { StorageSettings } from "@/types/camera";

export const getStorageSettings = async (): Promise<StorageSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('storage_settings')
      .select('*')
      .single();
    
    if (error) {
      console.error('Error fetching storage settings:', error);
      return null;
    }
    
    return data as StorageSettings;
  } catch (error) {
    console.error('Error fetching storage settings:', error);
    return null;
  }
};

export const saveStorageSettings = async (settings: Partial<StorageSettings>): Promise<boolean> => {
  try {
    // Check if settings already exist
    const { data, error } = await supabase
      .from('storage_settings')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Error checking storage settings:', error);
      return false;
    }
    
    if (data && data.length > 0) {
      // Update existing settings
      const { error: updateError } = await supabase
        .from('storage_settings')
        .update(settings)
        .eq('id', data[0].id);
      
      if (updateError) {
        console.error('Error updating storage settings:', updateError);
        return false;
      }
    } else {
      // Insert new settings
      const { error: insertError } = await supabase
        .from('storage_settings')
        .insert({
          ...settings,
          id: crypto.randomUUID()
        });
      
      if (insertError) {
        console.error('Error inserting storage settings:', insertError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error saving storage settings:', error);
    return false;
  }
};

export const getStorageUsage = async (): Promise<{ used: number, total: number, percentage: number } | null> => {
  try {
    // This would typically be an API call to get actual storage usage
    // For now, we'll return mock data
    return {
      used: 128, // GB
      total: 1024, // GB
      percentage: 12.5
    };
  } catch (error) {
    console.error('Error fetching storage usage:', error);
    return null;
  }
};
