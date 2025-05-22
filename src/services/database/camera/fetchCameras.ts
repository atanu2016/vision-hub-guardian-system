
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
      id: camera.id,
      name: camera.name,
      status: (camera.status as CameraStatus) || 'offline',
      location: camera.location || 'Unknown',
      ipaddress: camera.ipaddress || '',
      lastseen: camera.lastseen || new Date().toISOString(),
      recording: camera.recording === true,
      port: camera.port,
      username: camera.username,
      password: camera.password,
      model: camera.model,
      manufacturer: camera.manufacturer,
      connectiontype: camera.connectiontype,
      thumbnail: camera.thumbnail,
      group: camera.group,
      motiondetection: camera.motiondetection,
      rtmpurl: camera.rtmpurl || '',
      hlsurl: camera.hlsurl || '',
      onvifpath: camera.onvifpath || '',
      quality: camera.quality || '',
      schedule_type: camera.schedule_type || '',
      time_start: camera.time_start || '',
      time_end: camera.time_end || '',
      days_of_week: camera.days_of_week || []
    })) || [];
    
    return cameras;
  } catch (error) {
    throw logDatabaseError(error, "Failed to fetch cameras");
  }
};
