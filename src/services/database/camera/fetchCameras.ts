
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
      // For RTSP and HLS connection types, use rtmpurl as a fallback
      // since rtspurl and hlsurl don't exist in the database yet
      let streamUrl: string | undefined = undefined;
      
      if (cam.connectiontype === 'rtsp' || cam.connectiontype === 'hls') {
        streamUrl = cam.rtmpurl; // Use rtmpurl for both types as a fallback
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
        rtmpUrl: cam.connectiontype === 'rtmp' ? cam.rtmpurl : undefined,
        rtspUrl: cam.connectiontype === 'rtsp' ? streamUrl : undefined,
        hlsUrl: cam.connectiontype === 'hls' ? streamUrl : undefined,
        onvifPath: cam.onvifpath || undefined,
        motionDetection: cam.motiondetection || false
      };
    });
    
    return cameras;
  } catch (error) {
    throw logDatabaseError(error, "Failed to fetch cameras");
  }
};
