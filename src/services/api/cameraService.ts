
import { supabase } from "@/integrations/supabase/client";
import { Camera } from "@/types/camera";
import { toDatabaseCamera } from "@/utils/cameraPropertyMapper";

/**
 * Save camera to database
 * @param camera Camera object to save
 * @returns Promise resolving to the saved camera
 */
export const saveCamera = async (camera: Camera) => {
  try {
    const { data, error } = await supabase
      .from('cameras')
      .upsert(camera, { onConflict: 'id' })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error saving camera:', err);
    throw err;
  }
};

/**
 * Get all cameras from database
 * @returns Promise resolving to array of cameras
 */
export const getCameras = async (): Promise<Camera[]> => {
  try {
    const { data, error } = await supabase
      .from('cameras')
      .select('*');
      
    if (error) throw error;
    
    // Ensure the status field is a valid CameraStatus
    const validCameras = (data || []).map(cam => ({
      ...cam,
      status: (cam.status === 'online' || cam.status === 'offline' || cam.status === 'recording') 
        ? cam.status 
        : 'offline' as 'online' | 'offline' | 'recording'
    })) as Camera[];
    
    return validCameras;
  } catch (err) {
    console.error('Error fetching cameras:', err);
    throw err;
  }
};

/**
 * Delete a camera from database
 * @param id Camera ID to delete
 * @returns Promise resolving when camera is deleted
 */
export const deleteCamera = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('cameras')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  } catch (err) {
    console.error('Error deleting camera:', err);
    throw err;
  }
};

/**
 * Setup camera stream (implementation depends on your specific needs)
 */
export const setupCameraStream = (camera: Camera, videoElement: HTMLVideoElement, onError: (err: string) => void) => {
  // This is a simplified implementation for demo purposes
  console.log('Setting up stream for camera:', camera.id);
  
  // This should be replaced with actual implementation to set up the camera stream
  // Return cleanup function
  return () => {
    console.log('Cleaning up stream for camera:', camera.id);
  };
};
