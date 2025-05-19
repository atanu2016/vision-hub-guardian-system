
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Assigns cameras to a specific user
 */
export async function assignCamerasToUser(userId: string, cameraIds: string[]): Promise<boolean> {
  try {
    console.log(`Assigning cameras to user ${userId}. Camera IDs:`, cameraIds);
    
    // Check for valid session before making any requests
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      toast.error("Authentication error. Please log in again.");
      return false;
    }
    
    if (!sessionData.session) {
      console.error("No active session when attempting to assign cameras");
      toast.error("You must be logged in to assign cameras. Please log in again.");
      return false;
    }
    
    if (!userId) {
      toast.error("No user selected for camera assignment");
      throw new Error("User ID is required");
    }
    
    // First, delete all existing user-camera assignments to avoid stale data
    const { error: deleteError } = await supabase
      .from('user_camera_access')
      .delete()
      .eq('user_id', userId);
      
    if (deleteError) {
      console.error("Error removing existing camera assignments:", deleteError);
      if (deleteError.code === 'PGRST301') {
        toast.error("Not authorized. Please log in with admin privileges.");
      } else {
        toast.error("Could not update camera assignments. Database error occurred.");
      }
      return false;
    }
    
    // If there are no cameras to assign, we're done (we already removed all assignments)
    if (cameraIds.length === 0) {
      console.log("No cameras to assign, all assignments cleared");
      toast.success("Camera assignments cleared successfully");
      return true;
    }
    
    // Prepare batch of assignments to insert
    const assignmentsToInsert = cameraIds.map(cameraId => ({
      user_id: userId,
      camera_id: cameraId,
      created_at: new Date().toISOString()
    }));
    
    // Insert all new assignments in a single batch operation
    const { error: insertError } = await supabase
      .from('user_camera_access')
      .insert(assignmentsToInsert);
      
    if (insertError) {
      console.error("Error adding camera assignments:", insertError);
      if (insertError.code === 'PGRST301') {
        toast.error("Not authorized. Please log in with admin privileges.");
      } else if (insertError.message.includes('foreign key constraint')) {
        toast.error("One or more cameras do not exist in the system.");
      } else {
        toast.error("Could not update camera assignments. Please try again.");
      }
      return false;
    }
    
    console.log(`Successfully assigned ${cameraIds.length} cameras to user ${userId}`);
    return true;
  } catch (error: any) {
    console.error('Error assigning cameras to user:', error);
    toast.error(error?.message || "Could not update camera assignments");
    return false;
  }
}
