
import { supabase } from '@/integrations/supabase/client';
import { Camera, CameraStatus } from '@/types/camera';
import { getUserAssignedCameras } from './getUserCameras';

/**
 * Returns cameras that a user can access based on role and assignments
 */
export async function getAccessibleCameras(userId: string, userRole: string): Promise<Camera[]> {
  try {
    console.log(`Getting accessible cameras for user ${userId} with role ${userRole}`);
    
    // If admin or superadmin, return all cameras
    if (userRole === 'admin' || userRole === 'superadmin') {
      console.log("User is admin/superadmin, fetching all cameras");
      const { data, error } = await supabase
        .from('cameras')
        .select('*');
        
      if (error) {
        console.error("Error fetching all cameras:", error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} cameras for admin user`);
      // Transform database fields to match Camera type
      return transformCameraData(data || []);
    }
    
    // For regular users, get their assigned camera IDs
    console.log("User is not admin, fetching assigned cameras");
    const assignedCameraIds = await getUserAssignedCameras(userId);
    
    if (assignedCameraIds.length === 0) {
      console.log("No camera assignments found for user");
      return [];
    }
    
    console.log(`User has ${assignedCameraIds.length} assigned cameras, fetching details`);
    
    // Fetch the actual camera details for the assigned IDs
    const { data, error } = await supabase
      .from('cameras')
      .select('*')
      .in('id', assignedCameraIds);
      
    if (error) {
      console.error("Error fetching assigned cameras:", error);
      return [];
    }
    
    console.log(`Found ${data?.length || 0} accessible cameras for user`);
    
    // Transform database fields to match Camera type
    return transformCameraData(data || []);
  } catch (error) {
    console.error('Error fetching accessible cameras:', error);
    return [];
  }
}

/**
 * Helper function to transform database camera fields to Camera type
 */
function transformCameraData(data: any[]): Camera[] {
  return data.map(cam => ({
    id: cam.id,
    name: cam.name,
    location: cam.location,
    ipAddress: cam.ipaddress,
    port: cam.port || 80,
    username: cam.username,
    password: cam.password,
    rtmpUrl: cam.rtmpurl,
    connectionType: cam.connectiontype as Camera['connectionType'],
    onvifPath: cam.onvifpath,
    manufacturer: cam.manufacturer,
    model: cam.model,
    status: (cam.status || 'offline') as CameraStatus,
    lastSeen: cam.lastseen,
    motionDetection: cam.motiondetection || false,
    recording: cam.recording || false,
    thumbnail: cam.thumbnail,
    group: cam.group
  }));
}
