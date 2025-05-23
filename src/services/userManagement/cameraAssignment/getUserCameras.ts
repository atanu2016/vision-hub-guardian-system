
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Get cameras assigned to a specific user
 */
export async function getUserAssignedCameras(userId: string): Promise<string[]> {
  try {
    console.log("Fetching assigned cameras for user:", userId);
    
    // Check for valid session before making the request
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.warn("No active session found when fetching camera assignments");
      return [];
    }
    
    if (!userId) {
      console.warn("No user ID provided to getUserAssignedCameras");
      return [];
    }
    
    // Direct query with simplified approach
    const { data, error } = await supabase
      .from('user_camera_access')
      .select('camera_id')
      .eq('user_id', userId);
      
    if (error) {
      console.error("Error fetching camera assignments:", error);
      throw error;
    }
    
    const cameraIds = data?.map(item => item.camera_id) || [];
    console.log(`User ${userId} has ${cameraIds.length} assigned cameras:`, cameraIds);
    
    return cameraIds;
  } catch (error) {
    console.error('Error fetching user assigned cameras:', error);
    // Don't show toast here - let the calling component handle the error display
    // Return empty array instead of throwing to prevent UI crashes
    return [];
  }
}
