
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
      
      // Ensure proper type casting for status
      const camerasWithCorrectStatus = (data || []).map(cam => ({
        ...cam,
        status: (cam.status as CameraStatus) || 'offline'
      })) as Camera[];
      
      console.log(`Found ${camerasWithCorrectStatus.length || 0} cameras for admin user`);
      return camerasWithCorrectStatus;
    }
    
    // For regular users and observers, get their assigned camera IDs
    console.log("User is not admin, fetching assigned cameras");
    try {
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
      
      // Ensure proper type casting for status
      const camerasWithCorrectStatus = (data || []).map(cam => ({
        ...cam,
        status: (cam.status as CameraStatus) || 'offline'
      })) as Camera[];
      
      console.log(`Found ${camerasWithCorrectStatus.length || 0} accessible cameras for user`);
      return camerasWithCorrectStatus;
    } catch (assignmentError) {
      console.error("Error in assignment retrieval:", assignmentError);
      return [];
    }
  } catch (error) {
    console.error('Error fetching accessible cameras:', error);
    return [];
  }
}
