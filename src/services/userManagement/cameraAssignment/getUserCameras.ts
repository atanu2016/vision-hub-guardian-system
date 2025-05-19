
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
    
    // Direct query to user_camera_access table
    const { data, error } = await supabase
      .from('user_camera_access')
      .select('camera_id')
      .eq('user_id', userId);
      
    if (error) {
      console.error("Error fetching user camera assignments:", error);
      return []; // Return empty array instead of throwing for resilience
    }
    
    const cameraIds = data?.map(item => item.camera_id) || [];
    console.log(`User ${userId} has ${cameraIds.length} assigned cameras:`, cameraIds);
    
    return cameraIds;
  } catch (error) {
    console.error('Error fetching user assigned cameras:', error);
    return []; // Return empty for resilience
  }
}
