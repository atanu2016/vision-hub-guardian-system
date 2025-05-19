
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { addLogToDB } from '@/services/database/logsService';

/**
 * Assigns cameras to a specific user with optimized performance and proper error handling
 */
export async function assignCamerasToUser(userId: string, cameraIds: string[]): Promise<boolean> {
  try {
    console.log(`Assigning cameras to user ${userId}. Camera count:`, cameraIds.length);
    
    // First check session - most crucial step with multiple fallbacks
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error when attempting camera assignment:", sessionError);
      toast.error("Your session has expired. Please log in again.");
      setTimeout(() => window.location.href = '/auth', 2000);
      return false;
    }
    
    if (!sessionData.session) {
      console.error("No valid session found during camera assignment");
      toast.error("Authentication required. Please log in again.");
      setTimeout(() => window.location.href = '/auth', 2000);
      return false;
    }
    
    // Do an explicit refresh of the session token before proceeding
    try {
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error("Failed to refresh session:", refreshError);
        toast.error("Session refresh failed. Please login again.");
        setTimeout(() => window.location.href = '/auth', 2000);
        return false;
      }
      console.log("Session refreshed successfully before camera assignment");
    } catch (refreshErr) {
      console.error("Error refreshing token:", refreshErr);
      // Continue with existing token as a fallback - it might still work
    }
    
    // Verify admin permissions - cannot assign cameras without them
    try {
      const { data: adminCheck, error: adminCheckError } = await supabase.rpc('is_admin_bypass_rls');
      
      if (adminCheckError) {
        console.error("Error checking admin permissions:", adminCheckError);
        toast.error("Permission verification failed: " + adminCheckError.message);
        return false;
      }
      
      if (!adminCheck) {
        console.error("User does not have admin permissions");
        toast.error("You don't have permission to assign cameras");
        return false;
      }
    } catch (permError: any) {
      console.error("Exception checking admin permissions:", permError);
      toast.error("Permission verification error: " + (permError?.message || "Unknown error"));
      return false;
    }
    
    if (!userId) {
      toast.error("No user selected for camera assignment");
      throw new Error("User ID is required");
    }
    
    // Log operation but don't await it - let it run in background
    addLogToDB('info', `Starting camera assignment for user ${userId}`, 'camera-assignment', 
      `Assigning ${cameraIds.length} cameras to user ${userId}`);
    
    // Manual assignment approach - most reliable method
    try {
      // Delete existing assignments first
      const { error: deleteError } = await supabase
        .from('user_camera_access')
        .delete()
        .eq('user_id', userId);
      
      if (deleteError) {
        console.error("Error deleting existing camera assignments:", deleteError);
        throw deleteError;
      }
      
      // Only insert new assignments if there are any to add
      if (cameraIds.length > 0) {
        // Prepare batch insert data
        const assignments = cameraIds.map(cameraId => ({
          user_id: userId,
          camera_id: cameraId,
          created_at: new Date().toISOString()
        }));
        
        // Insert all new assignments
        const { error: insertError } = await supabase
          .from('user_camera_access')
          .insert(assignments);
        
        if (insertError) {
          console.error("Error inserting camera assignments:", insertError);
          throw insertError;
        }
      }
      
      console.log(`Successfully assigned ${cameraIds.length} cameras to user ${userId}`);
      
      // Log success in background
      addLogToDB('info', `Completed camera assignment for user ${userId}`, 'camera-assignment', 
        `Successfully assigned ${cameraIds.length} cameras using direct method`);
      
      return true;
    } catch (error: any) {
      console.error('Error assigning cameras to user:', error);
      toast.error(error?.message || "Failed to update camera assignments");
      
      // Log exception in background
      addLogToDB('error', `Exception in camera assignment for user ${userId}`, 'camera-assignment', 
        `Error: ${error?.message || "Unknown error"}`);
        
      return false;
    }
  } catch (error: any) {
    console.error('Error in camera assignment process:', error);
    toast.error(error?.message || "Failed to update camera assignments");
    
    // Log exception in background
    addLogToDB('error', `Exception in camera assignment for user ${userId}`, 'camera-assignment', 
      `Error: ${error?.message || "Unknown error"}`);
      
    return false;
  }
}
