
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
    
    // Fetch camera assignments for user with retry mechanism
    let attempts = 0;
    const maxAttempts = 2;
    let cameraIds: string[] = [];
    
    while (attempts < maxAttempts) {
      attempts++;
      try {
        const { data, error } = await supabase
          .from('user_camera_access')
          .select('camera_id')
          .eq('user_id', userId);
          
        if (error) {
          console.warn(`Attempt ${attempts} - Error fetching camera assignments:`, error);
          if (attempts === maxAttempts) throw error;
          // Wait briefly before retry
          await new Promise(r => setTimeout(r, 500));
          continue;
        }
        
        cameraIds = data?.map(item => item.camera_id) || [];
        console.log(`User ${userId} has ${cameraIds.length} assigned cameras:`, cameraIds);
        break;
      } catch (fetchError) {
        if (attempts === maxAttempts) throw fetchError;
        console.warn(`Attempt ${attempts} - Error:`, fetchError);
        // Wait briefly before retry
        await new Promise(r => setTimeout(r, 500));
      }
    }
    
    return cameraIds;
  } catch (error) {
    console.error('Error fetching user assigned cameras:', error);
    return []; // Return empty for resilience
  }
}
