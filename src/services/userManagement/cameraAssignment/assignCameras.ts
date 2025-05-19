
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
    
    // Use batch processing with smaller chunks to prevent timeouts
    const BATCH_SIZE = 100;
    let allSuccessful = true;
    
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
    
    // Process in batches to prevent timeouts
    if (cameraIds.length > 0) {
      for (let i = 0; i < cameraIds.length; i += BATCH_SIZE) {
        const batch = cameraIds.slice(i, i + BATCH_SIZE);
        
        // Prepare data for bulk insert
        const assignmentsToInsert = batch.map(cameraId => ({
          user_id: userId,
          camera_id: cameraId,
          created_at: new Date().toISOString()
        }));
        
        // Insert batch
        const { error: insertError } = await supabase
          .from('user_camera_access')
          .insert(assignmentsToInsert);
          
        if (insertError) {
          console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, insertError);
          
          // Log the failure but continue with other batches
          await addLogToDB('error', `Failed batch ${i / BATCH_SIZE + 1} for user ${userId}`, 'camera-assignment', 
            `Error: ${insertError.message}`);
            
          allSuccessful = false;
        } else {
          console.log(`Successfully assigned batch ${i / BATCH_SIZE + 1} (${batch.length} cameras) to user ${userId}`);
        }
      }
    }
    
    if (!allSuccessful) {
      toast.error("Some camera assignments may not have been saved");
      return false;
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
