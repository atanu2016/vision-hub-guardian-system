
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
    const cameras: Camera[] = data.map(cam => {
      // For each connection type, determine the right URL to use
      let rtmpUrl = cam.rtmpurl;
      let rtspUrl = undefined;
      let hlsUrl = undefined;
      
      // Set the appropriate URL based on connection type
      // For backward compatibility, use rtmpurl as a fallback for rtsp and hls
      if (cam.connectiontype === 'rtsp') {
        rtspUrl = cam.rtmpurl; // Use rtmpurl for rtsp as a fallback
      } else if (cam.connectiontype === 'hls') {
        hlsUrl = cam.rtmpurl; // Use rtmpurl for hls as a fallback
      }
      
      return {
        id: cam.id,
        name: cam.name,
        status: cam.status as "online" | "offline" | "error",
        location: cam.location,
        ipAddress: cam.ipaddress,
        port: cam.port || 80,
        username: cam.username || undefined,
        password: cam.password || undefined,
        model: cam.model || undefined,
        manufacturer: cam.manufacturer || undefined,
        lastSeen: cam.lastseen,
        recording: cam.recording || false,
        thumbnail: cam.thumbnail || undefined,
        group: cam.group || undefined,
        connectionType: (cam.connectiontype as "ip" | "rtsp" | "rtmp" | "onvif" | "hls") || "ip",
        rtmpUrl: rtmpUrl || undefined,
        rtspUrl: rtspUrl || undefined,
        hlsUrl: hlsUrl || undefined,
        onvifPath: cam.onvifpath || undefined,
        motionDetection: cam.motiondetection || false
      };
    });
    
    console.log("Fetched and processed cameras:", cameras);
    return cameras;
  } catch (error) {
    throw logDatabaseError(error, "Failed to fetch cameras");
  }
};
