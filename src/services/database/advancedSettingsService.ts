
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logDatabaseError } from "./baseService";

// Advanced settings operations
export const fetchAdvancedSettingsFromDB = async () => {
  try {
    const { data, error } = await supabase
      .from('advanced_settings')
      .select('*')
      .limit(1)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No data found, insert default settings
        const defaultSettings = {
          server_port: '8080',
          log_level: 'info',
          debug_mode: false,
          mfa_enabled: false,
          log_retention_days: 30,
          min_log_level: 'info'
        };
        
        const { data: newData, error: insertError } = await supabase
          .from('advanced_settings')
          .insert(defaultSettings)
          .select()
          .single();
          
        if (insertError) throw insertError;
        return {
          serverPort: newData.server_port,
          logLevel: newData.log_level,
          debugMode: newData.debug_mode,
          mfaEnabled: newData.mfa_enabled,
          mfaSecret: newData.mfa_secret,
          logRetentionDays: newData.log_retention_days,
          minLogLevel: newData.min_log_level
        };
      }
      
      console.error("Error fetching advanced settings:", error);
      throw error;
    }
    
    return {
      serverPort: data.server_port,
      logLevel: data.log_level,
      debugMode: data.debug_mode,
      mfaEnabled: data.mfa_enabled,
      mfaSecret: data.mfa_secret,
      logRetentionDays: data.log_retention_days,
      minLogLevel: data.min_log_level
    };
  } catch (error) {
    logDatabaseError(error, "Failed to load advanced settings");
    
    // Return default settings on error
    return {
      serverPort: '8080',
      logLevel: 'info',
      debugMode: false,
      mfaEnabled: false,
      mfaSecret: '',
      logRetentionDays: 30,
      minLogLevel: 'info'
    };
  }
};

export const saveAdvancedSettingsToDB = async (settings: any) => {
  try {
    // Transform to DB format
    const dbSettings = {
      server_port: settings.serverPort,
      log_level: settings.logLevel,
      debug_mode: settings.debugMode,
      mfa_enabled: settings.mfaEnabled,
      mfa_secret: settings.mfaSecret,
      log_retention_days: settings.logRetentionDays,
      min_log_level: settings.minLogLevel
    };
    
    // Check for existing settings
    const { data: existingData } = await supabase
      .from('advanced_settings')
      .select('id')
      .limit(1);
      
    let query;
    if (existingData && existingData.length > 0) {
      // Update existing
      query = supabase
        .from('advanced_settings')
        .update(dbSettings)
        .eq('id', existingData[0].id);
    } else {
      // Insert new
      query = supabase
        .from('advanced_settings')
        .insert(dbSettings);
    }
    
    const { error } = await query;
    
    if (error) {
      console.error("Error saving advanced settings:", error);
      throw error;
    }
    
    toast("Success", {
      description: "Advanced settings saved successfully"
    });
    
    return true;
  } catch (error) {
    logDatabaseError(error, "Failed to save advanced settings");
    return false;
  }
};
