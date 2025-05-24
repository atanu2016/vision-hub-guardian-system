
import { supabase } from "@/integrations/supabase/client";
import { Camera } from "@/types/camera";
import { logDatabaseError } from "../baseService";
import { toast } from "sonner";

// Save (create or update) camera to database
export const saveCameraToDB = async (camera: Camera): Promise<Camera> => {
  try {
    console.log("Saving camera to database:", camera);
    
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
      port: camera.port || 80,
      username: camera.username || null,
      password: camera.password || null,
      model: camera.model || null,
      manufacturer: camera.manufacturer || null,
      lastseen: new Date().toISOString(),
      recording: camera.recording || false,
      thumbnail: camera.thumbnail || null,
      group: camera.group || null,
      connectiontype: camera.connectionType || 'ip',
      rtmpurl: null, // Initialize as null
      rtspurl: null, // Initialize as null  
      hlsurl: null,  // Initialize as null
      onvifpath: camera.onvifPath || null,
      motiondetection: camera.motionDetection || false
    };

    // Set the appropriate URL field based on connection type
    switch (camera.connectionType) {
      case 'rtsp':
        dbCamera.rtspurl = camera.rtspUrl || null;
        break;
      case 'rtmp':
        dbCamera.rtmpurl = camera.rtmpUrl || null;
        break;
      case 'hls':
        dbCamera.hlsurl = camera.hlsUrl || null;
        break;
    }

    console.log("Database camera object:", dbCamera);

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
      console.error("Database error saving camera:", error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    if (!data) {
      throw new Error("No data returned from database");
    }
    
    console.log("Camera saved successfully:", data);
    
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
      connectionType: (data.connectiontype as "ip" | "rtsp" | "rtmp" | "onvif" | "hls") || "ip",
      rtmpUrl: data.rtmpurl || undefined,
      rtspUrl: data.rtspurl || undefined,
      hlsUrl: data.hlsurl || undefined,
      onvifPath: data.onvifpath || undefined,
      motionDetection: data.motiondetection || false
    };
  } catch (error) {
    console.error("Error in saveCameraToDB:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    throw logDatabaseError(error, `Failed to save camera: ${errorMessage}`);
  }
};

// Delete camera from database
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

// Save camera recording status
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
