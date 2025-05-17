
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logDatabaseError } from "./baseService";

// Interface for system settings
export interface InterfaceSettings {
  darkMode: boolean;
  notifications: boolean;
  audio: boolean;
}

export interface DetectionSettings {
  sensitivityLevel: number;
}

export interface StorageSettings {
  autoDeleteOld: boolean;
  maxStorageSize: number;
  backupSchedule: string;
}

// Fetch system interface settings
export const fetchInterfaceSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('advanced_settings')
      .select('dark_mode, notifications_enabled, audio_enabled')
      .maybeSingle();
      
    if (error) {
      console.error("Error fetching interface settings:", error);
      throw error;
    }
    
    // Return default settings if no data
    if (!data) {
      return {
        darkMode: false,
        notifications: true,
        audio: true
      };
    }
    
    return {
      darkMode: data.dark_mode || false,
      notifications: data.notifications_enabled || true,
      audio: data.audio_enabled || true
    };
  } catch (error) {
    logDatabaseError(error, "Failed to load interface settings");
    
    // Return default settings on error
    return {
      darkMode: false,
      notifications: true,
      audio: true
    };
  }
};

// Save interface settings
export const saveInterfaceSettings = async (settings: InterfaceSettings) => {
  try {
    // Get existing record id first
    const { data: existingData } = await supabase
      .from('advanced_settings')
      .select('id')
      .limit(1);
    
    let query;
    if (existingData && existingData.length > 0) {
      query = supabase
        .from('advanced_settings')
        .update({
          dark_mode: settings.darkMode,
          notifications_enabled: settings.notifications,
          audio_enabled: settings.audio,
          updated_at: new Date()
        })
        .eq('id', existingData[0].id);
    } else {
      // Insert new settings if none exist
      query = supabase
        .from('advanced_settings')
        .insert({
          dark_mode: settings.darkMode,
          notifications_enabled: settings.notifications,
          audio_enabled: settings.audio
        });
    }
    
    const { error } = await query;
    
    if (error) {
      console.error("Error saving interface settings:", error);
      throw error;
    }
    
    toast.success("Interface settings saved");
    return true;
  } catch (error) {
    logDatabaseError(error, "Failed to save interface settings");
    return false;
  }
};

// Fetch detection settings
export const fetchDetectionSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('advanced_settings')
      .select('motion_sensitivity')
      .maybeSingle();
      
    if (error) {
      console.error("Error fetching detection settings:", error);
      throw error;
    }
    
    // Return default settings if no data
    return {
      sensitivityLevel: data?.motion_sensitivity || 50
    };
  } catch (error) {
    logDatabaseError(error, "Failed to load detection settings");
    
    // Return default settings on error
    return {
      sensitivityLevel: 50
    };
  }
};

// Save detection settings
export const saveDetectionSettings = async (settings: DetectionSettings) => {
  try {
    // Get existing record id first
    const { data: existingData } = await supabase
      .from('advanced_settings')
      .select('id')
      .limit(1);
    
    let query;
    if (existingData && existingData.length > 0) {
      query = supabase
        .from('advanced_settings')
        .update({
          motion_sensitivity: settings.sensitivityLevel,
          updated_at: new Date()
        })
        .eq('id', existingData[0].id);
    } else {
      // Insert new settings if none exist
      query = supabase
        .from('advanced_settings')
        .insert({
          motion_sensitivity: settings.sensitivityLevel
        });
    }
    
    const { error } = await query;
    
    if (error) {
      console.error("Error saving detection settings:", error);
      throw error;
    }
    
    toast.success("Detection settings saved");
    return true;
  } catch (error) {
    logDatabaseError(error, "Failed to save detection settings");
    return false;
  }
};

// Fetch additional storage settings that aren't in the storage_settings table
export const fetchAdditionalStorageSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('storage_settings')
      .select('overwriteoldest, max_storage_gb, backup_schedule')
      .maybeSingle();
      
    if (error) {
      console.error("Error fetching storage settings:", error);
      throw error;
    }
    
    // Return default settings if no data
    if (!data) {
      return {
        autoDeleteOld: true,
        maxStorageSize: 500,
        backupSchedule: "never"
      };
    }
    
    return {
      autoDeleteOld: data.overwriteoldest || true,
      maxStorageSize: data.max_storage_gb || 500,
      backupSchedule: data.backup_schedule || "never"
    };
  } catch (error) {
    logDatabaseError(error, "Failed to load storage settings");
    
    // Return default settings on error
    return {
      autoDeleteOld: true,
      maxStorageSize: 500,
      backupSchedule: "never"
    };
  }
};

// Save additional storage settings
export const saveAdditionalStorageSettings = async (settings: StorageSettings) => {
  try {
    // Get existing record id first
    const { data: existingData } = await supabase
      .from('storage_settings')
      .select('id')
      .limit(1);
    
    let query;
    if (existingData && existingData.length > 0) {
      query = supabase
        .from('storage_settings')
        .update({
          overwriteoldest: settings.autoDeleteOld,
          max_storage_gb: settings.maxStorageSize,
          backup_schedule: settings.backupSchedule
        })
        .eq('id', existingData[0].id);
    } else {
      // Insert new settings if none exist
      query = supabase
        .from('storage_settings')
        .insert({
          overwriteoldest: settings.autoDeleteOld,
          max_storage_gb: settings.maxStorageSize,
          backup_schedule: settings.backupSchedule
        });
    }
    
    const { error } = await query;
    
    if (error) {
      console.error("Error saving storage settings:", error);
      throw error;
    }
    
    toast.success("Storage settings saved");
    return true;
  } catch (error) {
    logDatabaseError(error, "Failed to save storage settings");
    return false;
  }
};

// Fetch system information
export const fetchSystemInformation = async () => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    // Fetch user profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name, is_admin')
      .eq('id', userData.user?.id || '')
      .single();
    
    // Fetch system version info
    const { data: systemData } = await supabase
      .from('advanced_settings')
      .select('version, license_status, last_updated')
      .maybeSingle();
    
    return {
      userInfo: {
        username: profileData?.full_name || 'User',
        role: profileData?.is_admin ? 'admin' : 'user',
        email: userData.user?.email || ''
      },
      systemInfo: {
        version: systemData?.version || '1.0.0',
        license: systemData?.license_status || 'Active',
        lastUpdated: systemData?.last_updated ? 
          new Date(systemData.last_updated).toLocaleString() : 
          'Today at ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }
    };
  } catch (error) {
    console.error("Error fetching system information:", error);
    
    // Return default info on error
    return {
      userInfo: {
        username: 'User',
        role: 'user',
        email: ''
      },
      systemInfo: {
        version: '1.0.0',
        license: 'Active',
        lastUpdated: 'Today at ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }
    };
  }
};
