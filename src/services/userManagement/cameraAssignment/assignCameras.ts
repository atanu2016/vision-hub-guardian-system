
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { addLogToDB } from '@/services/database/logsService';

/**
 * Assigns cameras to a specific user with optimized performance and proper error handling
 */
export async function assignCamerasToUser(userId: string, cameraIds: string[]): Promise<boolean> {
  try {
    console.log(`Assigning ${cameraIds.length} camera(s) to user ${userId}`);
    
    // First, check if session is valid before proceeding
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("Session error:", sessionError);
      throw new Error("Session error: Please log in again");
    }
    
    if (!sessionData.session) {
      console.error("No active session found");
      throw new Error("No active session found. Please log in again.");
    }
    
    // For a single camera, use a simpler approach to avoid potential function call issues
    if (cameraIds.length === 1) {
      console.log("Using optimized single camera assignment flow");
      
      // First delete existing assignments
      const { error: deleteError } = await supabase
        .from('user_camera_access')
        .delete()
        .eq('user_id', userId);
      
      if (deleteError) {
        console.error("Error deleting existing camera assignments:", deleteError);
        throw deleteError;
      }
      
      // Then insert the single camera assignment
      const { error: insertError } = await supabase
        .from('user_camera_access')
        .insert({
          user_id: userId,
          camera_id: cameraIds[0],
          created_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error("Error inserting camera assignment:", insertError);
        throw insertError;
      }
      
      console.log(`Successfully assigned camera to user ${userId}`);
      
      // Log success
      addLogToDB('info', `Completed camera assignment for user ${userId}`, 'camera-assignment', 
        'Successfully assigned 1 camera');
      
      return true;
    } 
    
    // For multiple cameras, try to use the RPC function with fallback
    else {
      console.log("Using bulk camera assignment flow");
      try {
        // Try to use the database function for multiple cameras
        const { error } = await supabase.rpc(
          'assign_cameras_transaction',
          { 
            p_user_id: userId, 
            p_camera_ids: cameraIds 
          } as any // Type assertion to avoid TypeScript error
        );
        
        if (error) {
          console.error("Error in assign_cameras_transaction RPC:", error);
          throw error;
        }
      } catch (rpcError) {
        console.error("RPC failed, falling back to direct database operations:", rpcError);
        
        // Fallback to direct database operations
        // First, delete all existing assignments for this user
        const { error: deleteError } = await supabase
          .from('user_camera_access')
          .delete()
          .eq('user_id', userId);
        
        if (deleteError) {
          console.error("Error deleting existing camera assignments:", deleteError);
          throw deleteError;
        }
        
        // Prepare array of records to insert
        const accessRecords = cameraIds.map(cameraId => ({
          user_id: userId,
          camera_id: cameraId,
          created_at: new Date().toISOString()
        }));
        
        // Insert all camera assignments in one operation
        const { error: insertError } = await supabase
          .from('user_camera_access')
          .insert(accessRecords);
        
        if (insertError) {
          console.error("Error inserting new camera assignments:", insertError);
          throw insertError;
        }
      }
      
      console.log(`Successfully assigned ${cameraIds.length} cameras to user ${userId}`);
      
      // Log success
      addLogToDB('info', `Completed camera assignment for user ${userId}`, 'camera-assignment', 
        `Successfully assigned ${cameraIds.length} cameras`);
      
      return true;
    }
  } catch (error: any) {
    console.error('Error assigning cameras to user:', error);
    toast.error(error?.message || "Failed to update camera assignments");
    
    // Log exception
    addLogToDB('error', `Exception in camera assignment for user ${userId}`, 'camera-assignment', 
      `Error: ${error?.message || "Unknown error"}`);
      
    return false;
  }
}
