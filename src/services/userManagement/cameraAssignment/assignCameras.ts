
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { addLogToDB } from '@/services/database/logsService';

/**
 * Assigns cameras to a specific user with optimized performance and proper error handling
 */
export async function assignCamerasToUser(userId: string, cameraIds: string[]): Promise<boolean> {
  try {
    console.log(`Assigning ${cameraIds.length} camera(s) to user ${userId}`);
    
    // Quick session validation without full refresh
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error("Session issue:", sessionError || "No session");
      throw new Error("Authentication required. Please log in again.");
    }
    
    // Performance optimization: Use a single transaction approach
    // Step 1: Delete existing assignments - but don't wait for it if possible
    const deletePromise = supabase
      .from('user_camera_access')
      .delete()
      .eq('user_id', userId);
    
    // Step 2: Prepare the records to insert (if any)
    let accessRecords = [];
    if (cameraIds.length > 0) {
      accessRecords = cameraIds.map(cameraId => ({
        user_id: userId,
        camera_id: cameraId,
        created_at: new Date().toISOString()
      }));
    }
    
    // Wait for delete to complete
    const { error: deleteError } = await deletePromise;
    if (deleteError) {
      console.error("Error deleting existing camera assignments:", deleteError);
      throw deleteError;
    }
    
    // Step 3: Insert new assignments if we have any
    if (accessRecords.length > 0) {
      const { error: insertError } = await supabase
        .from('user_camera_access')
        .insert(accessRecords);
      
      if (insertError) {
        console.error("Error inserting camera assignments:", insertError);
        throw insertError;
      }
    }
    
    console.log(`Successfully assigned ${cameraIds.length} cameras to user ${userId}`);
    
    // Log success, but don't block returning
    setTimeout(() => {
      addLogToDB('info', `Completed camera assignment for user ${userId}`, 'camera-assignment', 
        `Successfully assigned ${cameraIds.length} cameras`);
    }, 0);
    
    return true;
  } catch (error: any) {
    console.error('Error assigning cameras to user:', error);
    toast.error(error?.message || "Failed to update camera assignments");
    
    // Log exception, but don't block returning
    setTimeout(() => {
      addLogToDB('error', `Exception in camera assignment for user ${userId}`, 'camera-assignment', 
        `Error: ${error?.message || "Unknown error"}`);
    }, 0);
      
    return false;
  }
}
