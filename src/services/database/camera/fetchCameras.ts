
import { supabase } from "@/integrations/supabase/client";
import { Camera, CameraStatus } from "@/types/camera";
import { logDatabaseError } from "../baseService";

// Fetch cameras from database
export const fetchCamerasFromDB = async (): Promise<Camera[]> => {
  try {
    const { data, error } = await supabase
      .from('cameras')
      .select('*')
      .order('name');
    
    if (error) {
      console.error("Error fetching cameras:", error);
      throw error;
    }
    
    // Ensure we properly cast and handle all fields
    const cameras: Camera[] = data?.map(camera => ({
      ...camera,
      status: camera.status as CameraStatus,
      hlsurl: camera.hlsurl || undefined,
      rtmpurl: camera.rtmpurl || undefined,
      onvifpath: camera.onvifpath || undefined,
      quality: camera.quality || undefined,
      schedule_type: camera.schedule_type || undefined,
      time_start: camera.time_start || undefined,
      time_end: camera.time_end || undefined,
      days_of_week: camera.days_of_week || undefined
    })) || [];
    
    return cameras;
  } catch (error) {
    throw logDatabaseError(error, "Failed to fetch cameras");
  }
};
