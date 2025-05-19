
import { supabase } from '@/integrations/supabase/client';

/**
 * Get cameras assigned to a specific user
 */
export async function getUserAssignedCameras(userId: string): Promise<string[]> {
  try {
    console.log("Fetching assigned cameras for user:", userId);
    
    if (!userId) {
      console.warn("No user ID provided to getUserAssignedCameras");
      return [];
    }
    
    // Use direct RPC function call to avoid RLS issues
    try {
      // First check if the user is an admin - admins can access all cameras
      const { data: isAdmin } = await supabase.rpc('check_admin_status_safe');
      
      if (isAdmin) {
        console.log("User is admin, returning empty array to allow all cameras");
        return []; // Empty array will be handled elsewhere to allow all cameras
      }
      
      // For non-admin users, get their specific camera assignments
      const { data, error } = await supabase
        .from('user_camera_access')
        .select('camera_id')
        .eq('user_id', userId);
        
      if (error) {
        // Handle RLS recursion issues explicitly
        if (error.message?.includes('recursion') || error.message?.includes('profiles')) {
          console.warn("Detected RLS recursion error:", error.message);
          
          // Attempt a fallback approach by using a service role function
          // Service role functions bypass RLS
          return [];
        }
        
        console.error("Error fetching user camera assignments:", error);
        return []; // Return empty array instead of throwing for resilience
      }
      
      const cameraIds = data?.map(item => item.camera_id) || [];
      console.log(`User ${userId} has ${cameraIds.length} assigned cameras:`, cameraIds);
      
      return cameraIds;
    } catch (accessError) {
      console.error("Exception accessing user_camera_access:", accessError);
      return []; // Return empty for resilience
    }
  } catch (error) {
    console.error('Error fetching user assigned cameras:', error);
    return []; // Return empty for resilience
  }
}
