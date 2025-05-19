
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { addLogToDB } from '@/services/database/logsService';

/**
 * Assigns cameras to a specific user with extreme optimization for maximum performance
 */
export async function assignCamerasToUser(userId: string, cameraIds: string[]): Promise<boolean> {
  try {
    console.log(`Assigning ${cameraIds.length} camera(s) to user ${userId}`);
    
    // Performance shortcut: If no cameras to assign, just delete existing assignments
    // No need for session validation or extra queries
    if (cameraIds.length === 0) {
      await supabase
        .from('user_camera_access')
        .delete()
        .eq('user_id', userId);
      
      // Log success via non-blocking operation
      setTimeout(() => {
        addLogToDB('info', `Cleared camera assignments for user ${userId}`, 'camera-assignment', 'No cameras assigned');
      }, 0);
      
      return true;
    }
    
    // Quick session validation (minimal overhead)
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Authentication required. Please log in again.");
    }
    
    // EXTREME OPTIMIZATION: Use a batch operation for both delete and insert
    // This reduces round trips to the database server
    // First, create all records to insert for a single bulk insert operation
    const accessRecords = cameraIds.map(cameraId => ({
      user_id: userId,
      camera_id: cameraId,
      created_at: new Date().toISOString()
    }));
    
    // Run operations in parallel for maximum speed
    const [deleteResult, insertResult] = await Promise.all([
      // Delete existing assignments
      supabase
        .from('user_camera_access')
        .delete()
        .eq('user_id', userId),
      
      // Insert new assignments in a single batch operation
      supabase
        .from('user_camera_access')
        .insert(accessRecords)
    ]);
    
    // Check for errors
    if (deleteResult.error) throw deleteResult.error;
    if (insertResult.error) throw insertResult.error;
    
    console.log(`Successfully assigned ${cameraIds.length} cameras to user ${userId}`);
    
    // Log success via non-blocking operation
    setTimeout(() => {
      addLogToDB('info', `Completed camera assignment for user ${userId}`, 'camera-assignment', 
        `Successfully assigned ${cameraIds.length} cameras`);
    }, 0);
    
    return true;
  } catch (error: any) {
    console.error('Error assigning cameras to user:', error);
    toast.error(error?.message || "Failed to update camera assignments");
    
    // Log exception via non-blocking operation
    setTimeout(() => {
      addLogToDB('error', `Exception in camera assignment for user ${userId}`, 'camera-assignment', 
        `Error: ${error?.message || "Unknown error"}`);
    }, 0);
      
    return false;
  }
}
