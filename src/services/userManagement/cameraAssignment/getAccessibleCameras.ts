
import { supabase } from "@/integrations/supabase/client";
import { Camera, CameraStatus } from "@/types/camera";
import { CameraUIProps } from "@/utils/cameraPropertyMapper";

/**
 * Get cameras accessible to a user
 * @param userId User ID to check camera access for
 * @returns Array of cameras the user can access
 */
export const getAccessibleCameras = async (userId: string): Promise<Camera[]> => {
  try {
    // First get camera access list for the user
    const { data: accessList, error: accessError } = await supabase
      .from('user_camera_access')
      .select('camera_id')
      .eq('user_id', userId);

    if (accessError) {
      console.error("Error fetching camera access:", accessError);
      return [];
    }

    // If no access records found, return empty array
    if (!accessList || accessList.length === 0) {
      return [];
    }

    // Extract camera IDs from access list
    const cameraIds = accessList.map(item => item.camera_id);

    // Fetch actual camera data
    const { data: cameras, error: cameraError } = await supabase
      .from('cameras')
      .select('*')
      .in('id', cameraIds);

    if (cameraError) {
      console.error("Error fetching cameras:", cameraError);
      return [];
    }

    // Map the raw camera data to Camera objects
    return (cameras || []).map(cam => ({
      id: cam.id,
      name: cam.name,
      ipaddress: cam.ipaddress || '',
      port: cam.port,
      username: cam.username,
      password: cam.password,
      location: cam.location || 'Unknown',
      status: (cam.status as CameraStatus) || 'offline',
      lastseen: cam.lastseen || new Date().toISOString(),
      recording: cam.recording === true,
      motiondetection: cam.motiondetection,
      rtmpurl: cam.rtmpurl || '',
      hlsurl: cam.hlsurl || '',
      onvifpath: cam.onvifpath || '',
      connectiontype: cam.connectiontype,
      group: cam.group,
      thumbnail: cam.thumbnail,
      manufacturer: cam.manufacturer,
      model: cam.model,
      quality: cam.quality || '',
      schedule_type: cam.schedule_type || '',
      time_start: cam.time_start || '',
      time_end: cam.time_end || '',
      days_of_week: cam.days_of_week || []
    }));
  } catch (error) {
    console.error("Error getting accessible cameras:", error);
    return [];
  }
};

/**
 * Convert database format cameras to UI format
 */
export const convertToUICameras = (cameras: Camera[]): CameraUIProps[] => {
  return cameras.map(cam => ({
    id: cam.id,
    name: cam.name,
    ipAddress: cam.ipaddress,
    port: cam.port || 80,
    username: cam.username,
    password: cam.password,
    location: cam.location || 'Unknown',
    status: cam.status,
    lastSeen: cam.lastseen,
    recording: cam.recording || false,
    motionDetection: cam.motiondetection,
    rtmpUrl: cam.rtmpurl,
    hlsUrl: cam.hlsurl,
    onvifPath: cam.onvifpath,
    connectionType: cam.connectiontype as any || 'ip',
    model: cam.model,
    manufacturer: cam.manufacturer,
    group: cam.group,
    thumbnail: cam.thumbnail
  }));
};

/**
 * Convert UI format cameras to database format
 */
export const convertToDatabaseCameras = (uiCameras: CameraUIProps[]): Camera[] => {
  return uiCameras.map(cam => ({
    id: cam.id,
    name: cam.name,
    ipaddress: cam.ipAddress,
    port: cam.port,
    username: cam.username,
    password: cam.password,
    location: cam.location,
    status: cam.status as CameraStatus,
    lastseen: cam.lastSeen,
    recording: cam.recording,
    motiondetection: cam.motionDetection,
    rtmpurl: cam.rtmpUrl,
    hlsurl: cam.hlsUrl,
    onvifpath: cam.onvifPath,
    connectiontype: cam.connectionType,
    model: cam.model,
    manufacturer: cam.manufacturer,
    group: cam.group,
    thumbnail: cam.thumbnail,
    quality: undefined,
    schedule_type: undefined,
    time_start: undefined,
    time_end: undefined,
    days_of_week: undefined
  }));
};
