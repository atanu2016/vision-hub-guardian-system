
import { supabase } from '@/integrations/supabase/client';
import { Camera } from '@/components/admin/camera-assignment/types';
import { getUserAssignedCameras } from '@/services/userManagement/cameraAssignment';
import { toast } from 'sonner';

/**
 * Fetches all cameras from the database
 */
export const fetchAllCameras = async (): Promise<{ 
  data: any[] | null, 
  error: string | null 
}> => {
  try {
    const { data, error } = await supabase
      .from('cameras')
      .select('id, name, location, group')
      .order('name', { ascending: true });
      
    if (error) {
      console.error("Error fetching cameras:", error);
      return { data: null, error: error.message };
    }
    
    return { data, error: null };
  } catch (error: any) {
    console.error("Exception in fetchAllCameras:", error);
    return { data: null, error: error?.message || "Unknown error fetching cameras" };
  }
};

/**
 * Formats cameras with assignment status
 */
export const formatCamerasWithAssignments = (
  allCameras: any[], 
  assignedCameraIds: string[]
): Camera[] => {
  return allCameras.map(camera => ({
    id: camera.id,
    name: camera.name || 'Unnamed Camera',
    location: camera.location || 'Unknown Location',
    group: camera.group || 'Uncategorized',
    assigned: assignedCameraIds.includes(camera.id)
  }));
};

/**
 * Fetches user's assigned camera IDs
 */
export const fetchUserAssignments = async (
  userId: string
): Promise<string[]> => {
  try {
    const assignedCameraIds = await getUserAssignedCameras(userId);
    console.log(`User ${userId} has ${assignedCameraIds.length} assigned cameras`);
    return assignedCameraIds;
  } catch (error: any) {
    console.error("Error fetching camera assignments:", error);
    toast.error("Could not load current assignments. Will start with empty selection.");
    return [];
  }
};
