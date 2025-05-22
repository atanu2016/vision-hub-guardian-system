
import { supabase } from "@/integrations/supabase/client";
import { logDatabaseError } from "../baseService";
import { Camera } from "@/types/camera"; 

// Save camera to database
export const saveCameraToDB = async (camera: Omit<Camera, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('cameras')
      .insert(camera)
      .select()
      .single();

    if (error) {
      console.error("Error saving camera:", error);
      throw error;
    }

    return data;
  } catch (error) {
    throw logDatabaseError(error, "Failed to save camera");
  }
};

// Update camera in database
export const updateCameraInDB = async (id: string, camera: Partial<Camera>) => {
  try {
    const { data, error } = await supabase
      .from('cameras')
      .update(camera)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating camera:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    throw logDatabaseError(error, "Failed to update camera");
  }
};

// Delete camera from database
export const deleteCameraToDB = async (id: string) => {
  try {
    const { error } = await supabase
      .from('cameras')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error("Error deleting camera:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    throw logDatabaseError(error, "Failed to delete camera");
  }
};
