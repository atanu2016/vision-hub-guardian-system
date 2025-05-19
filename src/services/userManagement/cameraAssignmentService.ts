
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Camera, CameraStatus } from '@/types/camera';
import { logUserActivity } from '../activityLoggingService';

/**
 * Assigns cameras to a specific user
 */
export async function assignCamerasToUser(userId: string, cameraIds: string[]): Promise<boolean> {
  try {
    console.log(`Assigning cameras to user ${userId}. Camera IDs:`, cameraIds);
    
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    // Get current assignments - direct query to avoid RLS issues
    const { data: currentAssignments, error: fetchError } = await supabase
      .from('user_camera_access')
      .select('camera_id')
      .eq('user_id', userId);
      
    if (fetchError) {
      console.error("Error fetching current camera assignments:", fetchError);
      throw fetchError;
    }
    
    // Get assigned camera IDs
    const currentCameraIds = currentAssignments?.map(a => a.camera_id) || [];
    console.log("Current camera assignments:", currentCameraIds);
    
    // Get actor information for logging
    const { data: sessionData } = await supabase.auth.getSession();
    const actorEmail = sessionData?.session?.user?.email;
    const actorId = sessionData?.session?.user?.id;
    
    // Determine cameras to add and remove
    const camerasToRemove = currentCameraIds.filter(id => !cameraIds.includes(id));
    const camerasToAdd = cameraIds.filter(id => !currentCameraIds.includes(id));
    
    console.log("Cameras to remove:", camerasToRemove);
    console.log("Cameras to add:", camerasToAdd);
    
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
      // Create assignments array
      const assignmentsToInsert = camerasToAdd.map(cameraId => ({
        user_id: userId,
        camera_id: cameraId,
        created_at: new Date().toISOString()
      }));
      
      // Perform the insert, handling errors appropriately
      const { error: insertError } = await supabase
        .from('user_camera_access')
        .insert(assignmentsToInsert);
        
      if (insertError) {
        console.error("Error adding camera assignments:", insertError);
        throw insertError;
      }
    }
    
    // Log the activity
    try {
      await logUserActivity(
        'Camera assignments updated',
        `Camera access updated for user. Added: ${camerasToAdd.length}, Removed: ${camerasToRemove.length}`,
        userId,
        actorEmail
      );
    } catch (logError) {
      console.error("Error logging user activity:", logError);
      // Don't throw here, we still want to return success
    }
    
    console.log("Camera assignments updated successfully");
    return true;
  } catch (error) {
    console.error('Error assigning cameras to user:', error);
    throw error; // Propagate the error to be handled by the caller
  }
}

/**
 * Get cameras assigned to a specific user
 */
export async function getUserAssignedCameras(userId: string): Promise<string[]> {
  try {
    console.log("Fetching assigned cameras for user:", userId);
    
    if (!userId) {
      console.warn("No user ID provided to getUserAssignedCameras");
      return [];
    }
    
    const { data, error } = await supabase
      .from('user_camera_access')
      .select('camera_id')
      .eq('user_id', userId);
      
    if (error) {
      console.error("Error fetching user camera assignments:", error);
      return []; // Return empty array instead of throwing
    }
    
    const cameraIds = data?.map(item => item.camera_id) || [];
    console.log(`User ${userId} has ${cameraIds.length} assigned cameras:`, cameraIds);
    
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
    console.log(`Getting accessible cameras for user ${userId} with role ${userRole}`);
    
    // If admin or superadmin, return all cameras with direct query
    if (userRole === 'admin' || userRole === 'superadmin') {
      console.log("User is admin/superadmin, fetching all cameras");
      const { data, error } = await supabase
        .from('cameras')
        .select('*');
        
      if (error) {
        console.error("Error fetching all cameras:", error);
        throw error;
      }
      
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
        motionDetection: cam.motiondetection || false,
        recording: cam.recording || false,
        thumbnail: cam.thumbnail,
        group: cam.group
      }));
    }
    
    // For users and operators, first get assigned cameras from user_camera_access
    console.log("User is not admin, fetching assigned cameras");
    
    // Direct query to get camera assignments
    const { data: accessData, error: accessError } = await supabase
      .from('user_camera_access')
      .select('camera_id')
      .eq('user_id', userId);
      
    if (accessError) {
      console.error("Error fetching camera assignments:", accessError);
      return [];
    }
    
    const assignedCameraIds = accessData?.map(item => item.camera_id) || [];
    
    if (assignedCameraIds.length === 0) {
      console.log("User has no assigned cameras");
      return [];
    }
    
    console.log(`Fetching ${assignedCameraIds.length} assigned cameras`);
    const { data, error } = await supabase
      .from('cameras')
      .select('*')
      .in('id', assignedCameraIds);
      
    if (error) {
      console.error("Error fetching assigned cameras:", error);
      throw error;
    }
    
    console.log(`Found ${data.length} cameras for user`);
    
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
      status: (cam.status || 'offline') as CameraStatus,
      lastSeen: cam.lastseen,
      motionDetection: cam.motiondetection || false,
      recording: cam.recording || false,
      thumbnail: cam.thumbnail,
      group: cam.group
    }));
  } catch (error) {
    console.error('Error fetching accessible cameras:', error);
    return [];
  }
}
