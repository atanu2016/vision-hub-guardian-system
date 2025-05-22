
import { supabase } from "@/integrations/supabase/client";
import { Camera } from "@/types/camera";
import { logDatabaseError } from "../baseService";
import { toast } from "sonner";

// Sync cameras from public feeds to database if none exist
export const syncPublicCamerasToDatabase = async (publicCameras: Camera[]): Promise<void> => {
  try {
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
      return;
    }
    
    // Prepare cameras for insert
    const camerasToInsert = publicCameras.map(({id, ...rest}) => ({
      name: rest.name,
      status: rest.status,
      location: rest.location,
      ipaddress: rest.ipaddress,
      port: rest.port,
      username: rest.username,
      password: rest.password,
      model: rest.model,
      manufacturer: rest.manufacturer,
      lastseen: new Date().toISOString(),
      recording: rest.recording,
      thumbnail: rest.thumbnail,
      group: rest.group,
      connectiontype: rest.connectiontype,
      rtmpurl: rest.rtmpurl,
      onvifpath: rest.onvifpath,
      motiondetection: rest.motiondetection
    }));
    
    // Insert cameras
    const { error: insertError } = await supabase
      .from('cameras')
      .insert(camerasToInsert);
      
    if (insertError) {
      console.error("Error syncing public cameras:", insertError);
      throw insertError;
    }
    
    toast("Example camera feeds have been added to your database");
  } catch (error) {
    throw logDatabaseError(error, "Failed to sync public cameras");
  }
};
