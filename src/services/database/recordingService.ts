
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logDatabaseError } from "./baseService";

// Recording settings operations
export const fetchRecordingSettingsFromDB = async () => {
  try {
    const { data, error } = await supabase
      .from('recording_settings')
      .select('*')
      .limit(1)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No data found, insert default settings
        const defaultSettings = {
          continuous: true,
          motion_detection: true,
          schedule_type: "always",
          time_start: "00:00",
          time_end: "23:59",
          days_of_week: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
          quality: "medium"
        };
        
        const { data: newData, error: insertError } = await supabase
          .from('recording_settings')
          .insert(defaultSettings)
          .select()
          .single();
          
        if (insertError) throw insertError;
        return {
          continuous: newData.continuous,
          motionDetection: newData.motion_detection,
          schedule: newData.schedule_type,
          timeStart: newData.time_start,
          timeEnd: newData.time_end,
          daysOfWeek: newData.days_of_week,
          quality: newData.quality
        };
      }
      
      console.error("Error fetching recording settings:", error);
      throw error;
    }
    
    return {
      continuous: data.continuous,
      motionDetection: data.motion_detection,
      schedule: data.schedule_type,
      timeStart: data.time_start,
      timeEnd: data.time_end,
      daysOfWeek: data.days_of_week,
      quality: data.quality
    };
  } catch (error) {
    logDatabaseError(error, "Failed to load recording settings");
    
    // Return default settings on error
    return {
      continuous: true,
      motionDetection: true,
      schedule: "always", 
      timeStart: "00:00",
      timeEnd: "23:59",
      daysOfWeek: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
      quality: "medium"
    };
  }
};

export const saveRecordingSettingsToDB = async (settings: any) => {
  try {
    // Transform to DB format
    const dbSettings = {
      continuous: settings.continuous,
      motion_detection: settings.motionDetection,
      schedule_type: settings.schedule,
      time_start: settings.timeStart,
      time_end: settings.timeEnd,
      days_of_week: settings.daysOfWeek,
      quality: settings.quality
    };
    
    // Check for existing settings
    const { data: existingData } = await supabase
      .from('recording_settings')
      .select('id')
      .limit(1);
      
    let query;
    if (existingData && existingData.length > 0) {
      // Update existing
      query = supabase
        .from('recording_settings')
        .update(dbSettings)
        .eq('id', existingData[0].id);
    } else {
      // Insert new
      query = supabase
        .from('recording_settings')
        .insert(dbSettings);
    }
    
    const { error } = await query;
    
    if (error) {
      console.error("Error saving recording settings:", error);
      throw error;
    }
    
    toast("Success", {
      description: "Recording settings saved successfully"
    });
    
    return true;
  } catch (error) {
    logDatabaseError(error, "Failed to save recording settings");
    return false;
  }
};
