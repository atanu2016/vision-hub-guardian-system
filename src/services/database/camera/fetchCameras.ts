
import { supabase } from "@/integrations/supabase/client";
import { Camera } from "@/types/camera";
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
    
    // Transform the data to match our Camera type
    const cameras: Camera[] = data.map(cam => ({
      id: cam.id,
      name: cam.name,
      status: cam.status as "online" | "offline" | "recording",
      location: cam.location,
      ipaddress: cam.ipaddress,
      port: cam.port || 80,
      username: cam.username || undefined,
      password: cam.password || undefined,
      model: cam.model || undefined,
      manufacturer: cam.manufacturer || undefined,
      lastseen: cam.lastseen,
      recording: cam.recording || false,
      thumbnail: cam.thumbnail || undefined,
      group: cam.group || undefined,
      connectiontype: cam.connectiontype as "ip" | "rtsp" | "rtmp" | "onvif" || "ip",
      rtmpurl: cam.rtmpurl || undefined,
      onvifpath: cam.onvifpath || undefined,
      motiondetection: cam.motiondetection || false
    }));
    
    return cameras;
  } catch (error) {
    throw logDatabaseError(error, "Failed to fetch cameras");
  }
};
