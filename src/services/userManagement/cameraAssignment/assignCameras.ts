
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { addLogToDB } from '@/services/database/logsService';

/**
 * Assigns cameras to a specific user with optimized performance
 */
export async function assignCamerasToUser(userId: string, cameraIds: string[]): Promise<boolean> {
  try {
    console.log(`Assigning cameras to user ${userId}. Camera count:`, cameraIds.length);
    
    // Use the RPC function for admin check - fastest possible method without recursion
    const { data: adminCheck, error: adminCheckError } = await supabase.rpc('is_admin_bypass_rls');
    
    if (adminCheckError) {
      console.error("Error checking admin permissions:", adminCheckError);
      toast.error("Could not verify admin permissions");
      return false;
    }
    
    if (!adminCheck) {
      console.error("User does not have admin permissions");
      toast.error("You don't have permission to assign cameras");
      return false;
    }
    
    if (!userId) {
      toast.error("No user selected for camera assignment");
      throw new Error("User ID is required");
    }
    
    // Log the operation start
    await addLogToDB('info', `Starting camera assignment for user ${userId}`, 'camera-assignment', 
      `Assigning ${cameraIds.length} cameras to user ${userId}`);
      
    // Start a database transaction manually for atomic operations
    // First delete existing assignments
    const { error: deleteError } = await supabase
      .from('user_camera_access')
      .delete()
      .eq('user_id', userId);
      
    if (deleteError) {
      console.error("Error deleting existing camera assignments:", deleteError);
      toast.error("Failed to update camera assignments");
      
      // Log the failure
      await addLogToDB('error', `Failed camera assignment for user ${userId}`, 'camera-assignment', 
        `Error deleting existing assignments: ${deleteError.message}`);
        
      return false;
    }
    
    // Only insert new assignments if we have camera IDs
    if (cameraIds.length > 0) {
      // Prepare data for bulk insert
      const assignmentsToInsert = cameraIds.map(cameraId => ({
        user_id: userId,
        camera_id: cameraId,
        created_at: new Date().toISOString()
      }));
      
      // Insert all new assignments in a single batch
      const { error: insertError } = await supabase
        .from('user_camera_access')
        .insert(assignmentsToInsert);
        
      if (insertError) {
        console.error("Error inserting new camera assignments:", insertError);
        toast.error("Failed to update camera assignments");
        
        // Log the failure
        await addLogToDB('error', `Failed camera assignment for user ${userId}`, 'camera-assignment', 
          `Error inserting new assignments: ${insertError.message}`);
          
        return false;
      }
    }
    
    console.log(`Successfully assigned ${cameraIds.length} cameras to user ${userId}`);
    
    // Log the success
    await addLogToDB('info', `Completed camera assignment for user ${userId}`, 'camera-assignment', 
      `Successfully assigned ${cameraIds.length} cameras`);
      
    return true;
  } catch (error: any) {
    console.error('Error assigning cameras to user:', error);
    toast.error(error?.message || "Could not update camera assignments");
    
    // Log the exception
    await addLogToDB('error', `Exception in camera assignment for user ${userId}`, 'camera-assignment', 
      `Error: ${error?.message || "Unknown error"}`);
      
    return false;
  }
}
