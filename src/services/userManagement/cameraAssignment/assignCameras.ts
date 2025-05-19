
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Assigns cameras to a specific user
 */
export async function assignCamerasToUser(userId: string, cameraIds: string[]): Promise<boolean> {
  try {
    console.log(`Assigning cameras to user ${userId}. Camera IDs:`, cameraIds);
    
    // Check for valid session once (optimization)
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      toast.error("Authentication error. Please log in again.");
      window.location.href = '/auth'; // Redirect to auth page
      return false;
    }
    
    if (!sessionData.session) {
      console.error("No active session when attempting to assign cameras");
      toast.error("You must be logged in to assign cameras. Please log in again.");
      window.location.href = '/auth'; // Redirect to auth page
      return false;
    }
    
    if (!userId) {
      toast.error("No user selected for camera assignment");
      throw new Error("User ID is required");
    }
    
    // Check admin permissions using a more efficient single query approach
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
    
    // Use a transaction for better performance and atomicity
    try {
      // Step 1: Delete existing camera assignments (clear previous assignments)
      const { error: deleteError } = await supabase
        .from('user_camera_access')
        .delete()
        .eq('user_id', userId);
        
      if (deleteError) {
        console.error("Error removing existing camera assignments:", deleteError);
        throw deleteError;
      }
      
      // If there are no cameras to assign, we're done
      if (cameraIds.length === 0) {
        console.log("No cameras to assign, all assignments cleared");
        toast.success("Camera assignments cleared successfully");
        return true;
      }
      
      // Step 2: Insert new assignments (optimized to use fewer, larger batches)
      const BATCH_SIZE = 50; // Increased batch size for better performance
      const assignmentPromises = [];
      
      for (let i = 0; i < cameraIds.length; i += BATCH_SIZE) {
        const batch = cameraIds.slice(i, i + BATCH_SIZE);
        
        const assignmentsToInsert = batch.map(cameraId => ({
          user_id: userId,
          camera_id: cameraId,
          created_at: new Date().toISOString()
        }));
        
        // Create a promise for each batch insert
        const insertPromise = supabase
          .from('user_camera_access')
          .insert(assignmentsToInsert);
          
        assignmentPromises.push(insertPromise);
      }
      
      // Execute all batch operations in parallel
      const results = await Promise.all(assignmentPromises);
      
      // Check for errors in any of the batch operations
      const errors = results.filter(result => result.error).map(result => result.error);
      if (errors.length > 0) {
        console.error(`Errors adding camera assignments:`, errors);
        
        // Handle specific error types
        const firstError = errors[0];
        if (firstError.code === 'PGRST301') {
          toast.error("Not authorized. Please log in with admin privileges.");
        } else if (firstError.code === '23503') { // Foreign key violation
          toast.error("One or more cameras do not exist in the system.");
        } else if (firstError.code === '23505') { // Unique violation
          toast.error("Duplicate camera assignments detected.");
        } else {
          toast.error("Database error: " + (firstError.message || "Unknown error"));
        }
        return false;
      }
      
      console.log(`Successfully assigned ${cameraIds.length} cameras to user ${userId}`);
      toast.success(`Successfully assigned ${cameraIds.length} cameras to user ${userId}`);
      return true;
    } catch (innerError: any) {
      console.error('Error in insert operation:', innerError);
      toast.error("Database error during camera assignment");
      return false;
    }
  } catch (error: any) {
    console.error('Error assigning cameras to user:', error);
    toast.error(error?.message || "Could not update camera assignments");
    return false;
  }
}
