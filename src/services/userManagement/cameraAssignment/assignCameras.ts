
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { addLogToDB } from '@/services/database/logsService';

/**
 * Assigns cameras to a specific user with optimized performance
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
        console.warn("Token refresh failed, but continuing with existing token:", refreshError);
        // Continue with existing token - it might still work
      }
    } catch (refreshErr) {
      console.warn("Error refreshing token, continuing with existing token:", refreshErr);
      // Continue with existing token - it might still work
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
    
    // First try the optimized database function
    try {
      // Using type assertion to bypass TypeScript type checking for the RPC function name
      const { error } = await (supabase.rpc as any)('assign_cameras_transaction', {
        p_user_id: userId,
        p_camera_ids: cameraIds
      });
      
      if (error) throw error;
      
      console.log(`Successfully assigned ${cameraIds.length} cameras to user ${userId} using transaction`);
      
      // Log success in background
      addLogToDB('info', `Completed camera assignment for user ${userId}`, 'camera-assignment', 
        `Successfully assigned ${cameraIds.length} cameras`);
        
      return true;
    } catch (rpcError: any) {
      // If RPC fails, fall back to manual assignment approach
      console.warn("Transaction RPC failed, falling back to manual assignment:", rpcError);
      
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
      
      console.log(`Successfully assigned ${cameraIds.length} cameras to user ${userId} using manual approach`);
      
      // Log success in background
      addLogToDB('info', `Completed camera assignment for user ${userId}`, 'camera-assignment', 
        `Successfully assigned ${cameraIds.length} cameras using fallback method`);
      
      return true;
    }
  } catch (error: any) {
    console.error('Error assigning cameras to user:', error);
    toast.error(error?.message || "Failed to update camera assignments");
    
    // Log exception in background
    addLogToDB('error', `Exception in camera assignment for user ${userId}`, 'camera-assignment', 
      `Error: ${error?.message || "Unknown error"}`);
      
    return false;
  }
}
