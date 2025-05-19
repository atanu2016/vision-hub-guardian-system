
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
    const { data, error } = await supabase.rpc(
      'assign_cameras_transaction',
      { 
        p_user_id: userId, 
        p_camera_ids: cameraIds 
      } as any // Type assertion needed due to RPC function not in TypeScript definitions
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
