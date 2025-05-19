
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { addLogToDB } from '@/services/database/logsService';

/**
 * Assigns cameras to a specific user with optimized performance and proper error handling
 */
export async function assignCamerasToUser(userId: string, cameraIds: string[]): Promise<boolean> {
  try {
    console.log(`Assigning cameras to user ${userId}. Camera count:`, cameraIds.length);
    
    // Use the optimized database transaction function for maximum performance
    // Need to use 'as any' type assertion here since TypeScript doesn't recognize the function name
    const { data, error } = await supabase.rpc(
      'assign_cameras_transaction' as any, 
      { 
        p_user_id: userId, 
        p_camera_ids: cameraIds 
      }
    );
    
    if (error) {
      console.error("Error in camera assignment transaction:", error);
      throw error;
    }
    
    console.log(`Successfully assigned ${cameraIds.length} cameras to user ${userId} using transaction`);
    
    // Log success in background
    addLogToDB('info', `Completed camera assignment for user ${userId}`, 'camera-assignment', 
      `Successfully assigned ${cameraIds.length} cameras using database transaction`);
    
    return true;
  } catch (error: any) {
    console.error('Error assigning cameras to user:', error);
    toast.error(error?.message || "Failed to update camera assignments");
    
    // Log exception in background
    addLogToDB('error', `Exception in camera assignment for user ${userId}`, 'camera-assignment', 
      `Error: ${error?.message || "Unknown error"}`);
      
    return false;
  }
}
