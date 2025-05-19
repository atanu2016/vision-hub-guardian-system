
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { addLogToDB } from '@/services/database/logsService';

/**
 * Assigns cameras to a specific user with optimized performance and proper error handling
 */
export async function assignCamerasToUser(userId: string, cameraIds: string[]): Promise<boolean> {
  try {
    console.log(`Assigning cameras to user ${userId}. Camera count:`, cameraIds.length);
    
    // First, ensure we have a valid session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      console.error("No valid session for camera assignment:", sessionError);
      throw new Error("Authentication required. Please login again.");
    }
    
    // Start a PostgreSQL transaction manually since RPC might not be available
    // First, delete all existing assignments for this user
    const { error: deleteError } = await supabase
      .from('user_camera_access')
      .delete()
      .eq('user_id', userId);
    
    if (deleteError) {
      console.error("Error deleting existing camera assignments:", deleteError);
      throw deleteError;
    }
    
    // If there are cameras to assign, insert them
    if (cameraIds.length > 0) {
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
    
    // Log success in background
    addLogToDB('info', `Completed camera assignment for user ${userId}`, 'camera-assignment', 
      `Successfully assigned ${cameraIds.length} cameras using direct database operations`);
    
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
