
import { supabase } from "@/integrations/supabase/client";
import { Camera } from "@/types/camera";
import { logDatabaseError } from "./baseService";

// Camera operations
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
      connectionType: (cam.connectiontype as "ip" | "rtsp" | "rtmp" | "onvif") || "ip",
      rtmpUrl: cam.rtmpurl || undefined,
      onvifPath: cam.onvifpath || undefined,
      motionDetection: cam.motiondetection || false
    }));
    
    return cameras;
  } catch (error) {
    throw logDatabaseError(error, "Failed to fetch cameras");
  }
};

export const saveCameraToDB = async (camera: Camera): Promise<Camera> => {
  try {
    // Handle both insert and update cases
    if (camera.id && camera.id.startsWith('cam-')) {
      // Generated ID, replace with a UUID
      delete camera.id;
    }

    // Transform camera object to match database schema
    const dbCamera = {
      id: camera.id,
      name: camera.name,
      status: camera.status,
      location: camera.location, 
      ipaddress: camera.ipAddress,
      port: camera.port,
      username: camera.username,
      password: camera.password,
      model: camera.model,
      manufacturer: camera.manufacturer,
      lastseen: new Date().toISOString(),
      recording: camera.recording,
      thumbnail: camera.thumbnail,
      group: camera.group,
      connectiontype: camera.connectionType,
      rtmpurl: camera.rtmpUrl,
      onvifpath: camera.onvifPath,
      motiondetection: camera.motionDetection
    };

    let query;
    if (camera.id) {
      // Update existing camera
      query = supabase
        .from('cameras')
        .update(dbCamera)
        .eq('id', camera.id)
        .select()
        .single();
    } else {
      // Insert new camera
      query = supabase
        .from('cameras')
        .insert(dbCamera)
        .select()
        .single();
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error saving camera:", error);
      throw error;
    }
    
    // Transform back from DB format to our Camera type
    return {
      id: data.id,
      name: data.name,
      status: data.status as "online" | "offline" | "error",
      location: data.location,
      ipAddress: data.ipaddress,
      port: data.port || 80,
      username: data.username || undefined,
      password: data.password || undefined,
      model: data.model || undefined,
      manufacturer: data.manufacturer || undefined,
      lastSeen: data.lastseen,
      recording: data.recording || false,
      thumbnail: data.thumbnail || undefined,
      group: data.group || undefined,
      connectionType: (data.connectiontype as "ip" | "rtsp" | "rtmp" | "onvif") || "ip",
      rtmpUrl: data.rtmpurl || undefined,
      onvifPath: data.onvifpath || undefined,
      motionDetection: data.motiondetection || false
    };
  } catch (error) {
    throw logDatabaseError(error, "Failed to save camera");
  }
};

export const deleteCameraFromDB = async (cameraId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('cameras')
      .delete()
      .eq('id', cameraId);
    
    if (error) {
      console.error("Error deleting camera:", error);
      throw error;
    }
  } catch (error) {
    throw logDatabaseError(error, "Failed to delete camera");
  }
};

export const saveCameraRecordingStatus = async (cameraId: string, enabled: boolean): Promise<boolean> => {
  try {
    const { data: existing } = await supabase
      .from('camera_recording_status')
      .select()
      .eq('camera_id', cameraId)
      .maybeSingle();
      
    if (existing) {
      // Update
      const { error } = await supabase
        .from('camera_recording_status')
        .update({ enabled })
        .eq('camera_id', cameraId);
        
      if (error) throw error;
    } else {
      // Insert
      const { error } = await supabase
        .from('camera_recording_status')
        .insert({ camera_id: cameraId, enabled });
        
      if (error) throw error;
    }

    // Also update the recording flag in the cameras table for UI consistency
    const { error: cameraUpdateError } = await supabase
      .from('cameras')
      .update({ recording: enabled })
      .eq('id', cameraId);
      
    if (cameraUpdateError) {
      console.error("Error updating camera recording status:", cameraUpdateError);
    }
    
    return true;
  } catch (error) {
    logDatabaseError(error, "Error saving camera recording status", false);
    return false;
  }
};

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
      ipaddress: rest.ipAddress,
      port: rest.port,
      username: rest.username,
      password: rest.password,
      model: rest.model,
      manufacturer: rest.manufacturer,
      lastseen: new Date().toISOString(),
      recording: rest.recording,
      thumbnail: rest.thumbnail,
      group: rest.group,
      connectiontype: rest.connectionType,
      rtmpurl: rest.rtmpUrl,
      onvifpath: rest.onvifPath,
      motiondetection: rest.motionDetection
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
