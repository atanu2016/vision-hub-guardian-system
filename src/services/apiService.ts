
import { supabase } from "@/integrations/supabase/client";
import { Camera } from "@/types/camera";

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
