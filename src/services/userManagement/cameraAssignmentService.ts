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
    
    // First, get current assignments to determine which ones to remove
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
    
    // Check admin status multiple ways for reliability
    let isAdmin = false;
    
    try {
      // Direct check for admin/superadmin roles
      const { data: userRoleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', actorId)
        .maybeSingle();
        
      if (!roleError && userRoleData) {
        isAdmin = userRoleData.role === 'admin' || userRoleData.role === 'superadmin';
        console.log("Admin check via user_roles:", isAdmin);
      }
    } catch (e) {
      console.warn("Error checking user role:", e);
    }
    
    // If not admin yet, check via profiles table
    if (!isAdmin) {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', actorId)
          .single();
          
        if (!profileError && profileData) {
          isAdmin = !!profileData.is_admin;
          console.log("Admin check via profiles table:", isAdmin);
        }
      } catch (e) {
        console.warn("Error checking profile is_admin:", e);
      }
    }
    
    // Final check using special emails
    if (!isAdmin && actorEmail) {
      isAdmin = actorEmail === 'admin@home.local' || actorEmail === 'superadmin@home.local';
      console.log("Admin check via special email:", isAdmin, actorEmail);
    }
    
    console.log("Current user has admin status:", isAdmin);
    
    if (!isAdmin) {
      throw new Error("Only administrators can assign cameras");
    }
    
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
      throw error;
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
    
    // For users and operators, return only assigned cameras
    console.log("User is not admin, fetching assigned cameras");
    const assignedCameraIds = await getUserAssignedCameras(userId);
    
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
      status: cam.status as CameraStatus,
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
