
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
      .maybeSingle();
      
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
    
    return data as StorageSettings || {
      type: 'local',
      path: '/recordings',
      retentiondays: 30,
      overwriteoldest: true
    };
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
      .maybeSingle();
      
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

/**
 * Validate storage settings access
 * @param settings Storage settings to validate
 * @returns Promise resolving to boolean indicating validation success
 */
export const validateStorageAccess = async (settings: StorageSettings): Promise<boolean> => {
  // This is a mock function as actual validation would require backend API
  console.log('Validating storage settings:', settings);
  return true;
};

/**
 * Get system statistics
 * @returns Promise resolving to system statistics
 */
export const getSystemStats = async () => {
  try {
    const { data, error } = await supabase
      .from('system_stats')
      .select('*')
      .limit(1)
      .single();
      
    if (error) {
      console.error('Error fetching system stats:', error);
      return {
        total_cameras: 0,
        online_cameras: 0,
        offline_cameras: 0,
        recording_cameras: 0,
        storage_used: '0 GB',
        storage_total: '0 GB',
        storage_percentage: 0,
        uptime_hours: 0
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return {
      total_cameras: 0,
      online_cameras: 0,
      offline_cameras: 0,
      recording_cameras: 0,
      storage_used: '0 GB',
      storage_total: '0 GB',
      storage_percentage: 0,
      uptime_hours: 0
    };
  }
};

/**
 * Get alert settings
 * @returns Promise resolving to alert settings
 */
export const getAlertSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('alert_settings')
      .select('*')
      .limit(1)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching alert settings:', error);
      return {
        motion_detection: true,
        camera_offline: true,
        storage_warning: true,
        email_notifications: false,
        push_notifications: false,
        notification_sound: 'default'
      };
    }
    
    return data || {
      motion_detection: true,
      camera_offline: true,
      storage_warning: true,
      email_notifications: false,
      push_notifications: false,
      notification_sound: 'default'
    };
  } catch (error) {
    console.error('Error fetching alert settings:', error);
    return {
      motion_detection: true,
      camera_offline: true,
      storage_warning: true,
      email_notifications: false,
      push_notifications: false,
      notification_sound: 'default'
    };
  }
};

/**
 * Save alert settings
 * @param settings Alert settings to save
 * @returns Promise resolving to boolean indicating success
 */
export const saveAlertSettings = async (settings: any): Promise<boolean> => {
  try {
    const { data: existingSettings } = await supabase
      .from('alert_settings')
      .select('id')
      .limit(1)
      .maybeSingle();
      
    if (existingSettings) {
      const { error } = await supabase
        .from('alert_settings')
        .update(settings)
        .eq('id', existingSettings.id);
        
      if (error) {
        console.error('Error updating alert settings:', error);
        return false;
      }
    } else {
      const { error } = await supabase
        .from('alert_settings')
        .insert({
          ...settings,
          id: crypto.randomUUID()
        });
        
      if (error) {
        console.error('Error inserting alert settings:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error saving alert settings:', error);
    return false;
  }
};

/**
 * Get webhooks
 * @returns Promise resolving to webhooks
 */
export const getWebhooks = async () => {
  try {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*');
      
    if (error) {
      console.error('Error fetching webhooks:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return [];
  }
};

/**
 * Save webhook
 * @param webhook Webhook to save
 * @returns Promise resolving to boolean indicating success
 */
export const saveWebhook = async (webhook: any): Promise<boolean> => {
  try {
    if (webhook.id) {
      const { error } = await supabase
        .from('webhooks')
        .update(webhook)
        .eq('id', webhook.id);
        
      if (error) {
        console.error('Error updating webhook:', error);
        return false;
      }
    } else {
      const { error } = await supabase
        .from('webhooks')
        .insert({
          ...webhook,
          id: crypto.randomUUID()
        });
        
      if (error) {
        console.error('Error inserting webhook:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error saving webhook:', error);
    return false;
  }
};

/**
 * Delete webhook
 * @param id Webhook ID to delete
 * @returns Promise resolving to boolean indicating success
 */
export const deleteWebhook = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting webhook:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting webhook:', error);
    return false;
  }
};
