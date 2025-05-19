
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
    
    // Check if we can access the user_camera_access table 
    try {
      const { data, error } = await supabase
        .from('user_camera_access')
        .select('camera_id')
        .eq('user_id', userId);
        
      if (error) {
        // Special handling for RLS recursion issues
        if (error.message?.includes('infinite recursion')) {
          console.warn("RLS recursion error when fetching camera assignments");
          return []; // Return empty array as fallback
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
