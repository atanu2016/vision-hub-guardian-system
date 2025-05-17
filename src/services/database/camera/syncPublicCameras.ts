
import { supabase } from "@/integrations/supabase/client";
import { Camera } from "@/types/camera";
import { logDatabaseError } from "../baseService";
import { toast } from "sonner";

// Sample public RTMP streams
const PUBLIC_RTMP_STREAMS: Partial<Camera>[] = [
  {
    name: "Earth Cam - Times Square",
    location: "New York, USA",
    rtmpUrl: "rtmp://rtmp.livestream.com/live/newyork_hd",
    connectionType: "rtmp",
    status: "online",
    recording: true
  },
  {
    name: "Traffic Cam - Downtown",
    location: "Los Angeles, USA",
    rtmpUrl: "rtmp://openrtmp.lvlt.rtmphost.com/earthcam/earthcamtv",
    connectionType: "rtmp",
    status: "online",
    recording: false
  },
  {
    name: "Beach Cam - Miami",
    location: "Miami, Florida",
    rtmpUrl: "rtmp://wowza.jwplayer.com/live/stream1",
    connectionType: "rtmp",
    status: "online",
    recording: true
  },
  {
    name: "City View",
    location: "Seattle, USA",
    rtmpUrl: "rtmp://stream.online.com/live/cityview",
    connectionType: "rtmp",
    status: "online",
    recording: false
  }
];

// Sync cameras from public feeds to database if none exist
export const syncPublicCamerasToDatabase = async (publicCameras: Camera[] = []): Promise<void> => {
  try {
    console.log("Checking if cameras exist in database...");
    
    // First check if we have any cameras
    const { data: existingCameras, error: checkError } = await supabase
      .from('cameras')
      .select('id')
      .limit(1);
      
    if (checkError) {
      console.error("Error checking for existing cameras:", checkError);
      throw checkError;
    }
    
    // If we have cameras, don't sync
    if (existingCameras && existingCameras.length > 0) {
      console.log(`Found ${existingCameras.length} existing cameras, skipping sync`);
      return;
    }
    
    console.log("No existing cameras found, adding sample cameras...");
    
    // Use provided cameras or default to public RTMP streams
    const camerasToUse = publicCameras.length > 0 ? 
      publicCameras : 
      PUBLIC_RTMP_STREAMS as Camera[];
    
    // Prepare cameras for insert
    const camerasToInsert = camerasToUse.map((camera) => ({
      name: camera.name,
      status: camera.status,
      location: camera.location,
      ipaddress: camera.ipAddress || "",
      port: camera.port || null,
      username: camera.username || null,
      password: camera.password || null,
      model: camera.model || "Generic Camera",
      manufacturer: camera.manufacturer || "Generic",
      lastseen: new Date().toISOString(),
      recording: camera.recording || false,
      thumbnail: camera.thumbnail || null,
      group: camera.group || "Default",
      connectiontype: camera.connectionType || "rtmp",
      rtmpurl: camera.rtmpUrl || "",
      onvifpath: camera.onvifPath || null,
      motiondetection: camera.motionDetection || false
    }));
    
    console.log(`Adding ${camerasToInsert.length} sample cameras with RTMP streams`);
    
    // Insert cameras
    const { error: insertError } = await supabase
      .from('cameras')
      .insert(camerasToInsert);
      
    if (insertError) {
      console.error("Error syncing public cameras:", insertError);
      throw insertError;
    }
    
    toast.success("Sample cameras with RTMP streams have been added to your database");
    console.log("Sample cameras successfully added to database");
  } catch (error) {
    console.error("Failed to sync public cameras:", error);
    throw logDatabaseError(error, "Failed to sync public cameras");
  }
};

// Function to initialize sample cameras
export const initializeSampleCameras = async (): Promise<void> => {
  try {
    await syncPublicCamerasToDatabase();
    console.log("Camera initialization complete");
  } catch (error) {
    console.error("Error initializing sample cameras:", error);
  }
};
