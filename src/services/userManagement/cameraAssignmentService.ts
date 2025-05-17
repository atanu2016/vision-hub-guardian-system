
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Camera, CameraStatus } from '@/types/camera';
import { logUserActivity } from '../activityLoggingService';

/**
 * Assigns cameras to a specific user
 */
export async function assignCamerasToUser(userId: string, cameraIds: string[]): Promise<boolean> {
  try {
    console.log(`Assigning cameras to user ${userId}: ${JSON.stringify(cameraIds)}`);
    
    // First, get current assignments to determine which ones to remove
    const { data: currentAssignments, error: fetchError } = await supabase
      .from('user_camera_access')
      .select('camera_id')
      .eq('user_id', userId);
      
    if (fetchError) {
      console.error("Error fetching current assignments:", fetchError);
      throw fetchError;
    }
    
    // Get assigned camera IDs
    const currentCameraIds = currentAssignments?.map(a => a.camera_id) || [];
    console.log(`Current assignments: ${JSON.stringify(currentCameraIds)}`);
    
    // Get actor information for logging
    const { data: sessionData } = await supabase.auth.getSession();
    const actorEmail = sessionData?.session?.user?.email;
    
    // Determine cameras to add and remove
    const camerasToRemove = currentCameraIds.filter(id => !cameraIds.includes(id));
    const camerasToAdd = cameraIds.filter(id => !currentCameraIds.includes(id));
    
    console.log(`Cameras to remove: ${JSON.stringify(camerasToRemove)}`);
    console.log(`Cameras to add: ${JSON.stringify(camerasToAdd)}`);
    
    // Remove camera assignments that are no longer in the list
    if (camerasToRemove.length > 0) {
      const { error: removeError } = await supabase
        .from('user_camera_access')
        .delete()
        .eq('user_id', userId)
        .in('camera_id', camerasToRemove);
        
      if (removeError) {
        console.error("Error removing camera assignments:", removeError);
        throw removeError;
      }
    }
    
    // Add new camera assignments
    if (camerasToAdd.length > 0) {
      const assignmentsToInsert = camerasToAdd.map(cameraId => ({
        user_id: userId,
        camera_id: cameraId,
        created_at: new Date().toISOString()
      }));
      
      const { error: insertError } = await supabase
        .from('user_camera_access')
        .insert(assignmentsToInsert);
        
      if (insertError) {
        console.error("Error inserting camera assignments:", insertError);
        throw insertError;
      }
    }
    
    // Log the activity
    await logUserActivity(
      'Camera assignments updated',
      `Camera access updated for user. Added: ${camerasToAdd.length}, Removed: ${camerasToRemove.length}`,
      userId,
      actorEmail
    );
    
    toast.success('Camera assignments updated successfully');
    return true;
  } catch (error) {
    console.error('Error assigning cameras to user:', error);
    toast.error('Failed to update camera assignments');
    return false;
  }
}

/**
 * Get cameras assigned to a specific user
 */
export async function getUserAssignedCameras(userId: string): Promise<string[]> {
  try {
    console.log(`Getting assigned cameras for user: ${userId}`);
    const { data, error } = await supabase
      .from('user_camera_access')
      .select('camera_id')
      .eq('user_id', userId);
      
    if (error) {
      console.error("Error fetching user assigned cameras:", error);
      throw error;
    }
    
    const cameraIds = data?.map(item => item.camera_id) || [];
    console.log(`Found ${cameraIds.length} assigned cameras`);
    return cameraIds;
  } catch (error) {
    console.error('Error fetching user assigned cameras:', error);
    return [];
  }
}

/**
 * Returns cameras that a user can access based on role and assignments
 */
export async function getAccessibleCameras(userId: string, userRole: string): Promise<Camera[]> {
  try {
    console.log(`Getting accessible cameras for user: ${userId}, role: ${userRole}`);
    
    // If admin or superadmin, return all cameras
    if (userRole === 'admin' || userRole === 'superadmin') {
      const { data, error } = await supabase
        .from('cameras')
        .select('*');
        
      if (error) {
        console.error("Error fetching all cameras:", error);
        throw error;
      }
      
      console.log(`Found ${data.length} cameras for admin/superadmin`);
      
      // Transform database fields to match Camera type
      return data.map(cam => ({
        id: cam.id,
        name: cam.name,
        location: cam.location,
        ipAddress: cam.ipaddress,
        port: cam.port,
        username: cam.username,
        password: cam.password,
        rtmpUrl: cam.rtmpurl,
        connectionType: cam.connectiontype as Camera['connectionType'],
        onvifPath: cam.onvifpath,
        manufacturer: cam.manufacturer,
        model: cam.model,
        status: cam.status as CameraStatus,
        lastSeen: cam.lastseen,
        motionDetection: cam.motiondetection,
        recording: cam.recording,
        thumbnail: cam.thumbnail,
        group: cam.group
      }));
    }
    
    // For users and operators, return only assigned cameras
    const assignedCameraIds = await getUserAssignedCameras(userId);
    
    if (assignedCameraIds.length === 0) {
      console.log("No assigned cameras found for user");
      return [];
    }
    
    const { data, error } = await supabase
      .from('cameras')
      .select('*')
      .in('id', assignedCameraIds);
      
    if (error) {
      console.error("Error fetching assigned cameras:", error);
      throw error;
    }
    
    console.log(`Found ${data.length} assigned cameras for user/operator`);
    
    // Transform database fields to match Camera type
    return data.map(cam => ({
      id: cam.id,
      name: cam.name,
      location: cam.location,
      ipAddress: cam.ipaddress,
      port: cam.port,
      username: cam.username,
      password: cam.password,
      rtmpUrl: cam.rtmpurl,
      connectionType: cam.connectiontype as Camera['connectionType'],
      onvifPath: cam.onvifpath,
      manufacturer: cam.manufacturer,
      model: cam.model,
      status: cam.status as CameraStatus,
      lastSeen: cam.lastseen,
      motionDetection: cam.motiondetection,
      recording: cam.recording,
      thumbnail: cam.thumbnail,
      group: cam.group
    }));
  } catch (error) {
    console.error('Error fetching accessible cameras:', error);
    return [];
  }
}
