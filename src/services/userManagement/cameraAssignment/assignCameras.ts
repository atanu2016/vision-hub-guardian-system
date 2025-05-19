
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
    
    // First remove all existing assignments to avoid conflicts
    if (currentCameraIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('user_camera_access')
        .delete()
        .eq('user_id', userId);
        
      if (deleteError) {
        console.error("Error removing existing camera assignments:", deleteError);
        throw deleteError;
      }
    }
    
    // Then add all new assignments in a single operation
    if (cameraIds.length > 0) {
      const assignmentsToInsert = cameraIds.map(cameraId => ({
        user_id: userId,
        camera_id: cameraId,
        created_at: new Date().toISOString()
      }));
      
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
    toast.success("Camera assignments saved successfully");
    return true;
  } catch (error) {
    console.error('Error assigning cameras to user:', error);
    toast.error("Failed to save camera assignments");
    throw error; // Propagate the error to be handled by the caller
  }
}
