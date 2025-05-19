
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logUserActivity } from '../../activityLoggingService';

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
    for (const cameraId of camerasToRemove) {
      const { error: removeError } = await supabase
        .from('user_camera_access')
        .delete()
        .eq('user_id', userId)
        .eq('camera_id', cameraId);
        
      if (removeError) {
        console.error(`Error removing camera assignment for camera ${cameraId}:`, removeError);
        // Continue with others even if one fails
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
