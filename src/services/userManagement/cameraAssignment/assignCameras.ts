
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Assigns cameras to a specific user
 */
export async function assignCamerasToUser(userId: string, cameraIds: string[]): Promise<boolean> {
  try {
    console.log(`Assigning cameras to user ${userId}. Camera IDs:`, cameraIds);
    
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    // First, delete all existing user-camera assignments to avoid stale data
    const { error: deleteError } = await supabase
      .from('user_camera_access')
      .delete()
      .eq('user_id', userId);
      
    if (deleteError) {
      console.error("Error removing existing camera assignments:", deleteError);
      throw deleteError;
    }
    
    // If there are no cameras to assign, we're done (we already removed all assignments)
    if (cameraIds.length === 0) {
      console.log("No cameras to assign, all assignments cleared");
      return true;
    }
    
    // Prepare batch of assignments to insert
    const assignmentsToInsert = cameraIds.map(cameraId => ({
      user_id: userId,
      camera_id: cameraId,
      created_at: new Date().toISOString()
    }));
    
    // Insert all new assignments in a single batch operation
    const { error: insertError } = await supabase
      .from('user_camera_access')
      .insert(assignmentsToInsert);
      
    if (insertError) {
      console.error("Error adding camera assignments:", insertError);
      throw insertError;
    }
    
    console.log(`Successfully assigned ${cameraIds.length} cameras to user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error assigning cameras to user:', error);
    throw error; // Propagate error to be handled by caller
  }
}
