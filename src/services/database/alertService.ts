
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logDatabaseError } from "./baseService";

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
    logDatabaseError(error, "Failed to load alert settings");
    
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
    logDatabaseError(error, "Failed to save alert settings");
    return false;
  }
};
