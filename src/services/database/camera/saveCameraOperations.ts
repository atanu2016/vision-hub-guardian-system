
import { supabase } from "@/integrations/supabase/client";
import { Camera } from "@/types/camera";
import { logDatabaseError } from "../baseService";

// Save (create or update) camera to database
export const saveCameraToDB = async (camera: Camera): Promise<Camera> => {
  try {
    console.log("Saving camera to database:", camera);
    
    // Handle both insert and update cases
    if (camera.id && camera.id.startsWith('cam-')) {
      // Generated ID, replace with a UUID
      delete camera.id;
    }

    // For RTSP cameras, ensure we have a URL
    let finalRtspUrl = camera.rtspUrl;
    if (camera.connectionType === 'rtsp' && !finalRtspUrl && camera.ipAddress && camera.username && camera.password) {
      const port = camera.port || 554;
      finalRtspUrl = `rtsp://${camera.username}:${camera.password}@${camera.ipAddress}:${port}/stream1`;
      console.log("Generated RTSP URL for database save");
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
      // Initialize all URL fields as null first
      rtmpurl: null,
      rtspurl: null,
      hlsurl: null,
      onvifpath: camera.onvifPath || null,
      motiondetection: camera.motionDetection || false
    };

    // Set the appropriate URL field based on connection type and data
    switch (camera.connectionType) {
      case 'rtsp':
        dbCamera.rtspurl = finalRtspUrl || camera.rtspUrl || null;
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
      // Provide more helpful error messages
      if (error.message.includes('hlsurl')) {
        throw new Error(`Database error: The HLS URL field is not available. Please contact your administrator.`);
      } else if (error.message.includes('rtspurl')) {
        throw new Error(`Database error: The RTSP URL field is not available. Please contact your administrator.`);
      } else if (error.message.includes('constraint')) {
        throw new Error(`Database error: Invalid data format. Please check all fields.`);
      } else {
        throw new Error(`Database error: ${error.message}`);
      }
    }
    
    if (!data) {
      throw new Error("No data returned from database");
    }
    
    console.log("Camera saved successfully:", data);
    
    // Transform back from DB format to our Camera type
    const savedCamera = {
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

    console.log("Transformed saved camera:", savedCamera);
    return savedCamera;
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
