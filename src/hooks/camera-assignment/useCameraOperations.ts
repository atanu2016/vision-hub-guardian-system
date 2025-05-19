
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Camera } from '@/components/admin/camera-assignment/types';
import { toast } from 'sonner';

export function useCameraOperations(userId: string, cameras: Camera[], setCameras: (cameras: Camera[]) => void) {
  const [saving, setSaving] = useState(false);

  // Handle checkbox change
  const handleCameraToggle = (cameraId: string, checked: boolean) => {
    setCameras(cameras.map(camera => 
      camera.id === cameraId ? { ...camera, assigned: checked } : camera
    ));
  };
  
  // Save camera assignments
  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Get current assignments to determine what to add/remove
      const { data: currentAssignments, error: fetchError } = await supabase
        .from('user_camera_access')
        .select('camera_id')
        .eq('user_id', userId);
        
      if (fetchError) {
        console.error("Error fetching current assignments:", fetchError);
        throw fetchError;
      }
      
      // Convert to Set for quick lookup
      const currentlyAssigned = new Set(currentAssignments?.map(a => a.camera_id) || []);
      
      // Determine cameras to add and remove
      const toAdd = cameras
        .filter(c => c.assigned && !currentlyAssigned.has(c.id))
        .map(c => ({ user_id: userId, camera_id: c.id, created_at: new Date().toISOString() }));
        
      const toRemove = cameras
        .filter(c => !c.assigned && currentlyAssigned.has(c.id))
        .map(c => c.id);
      
      console.log("Cameras to add:", toAdd.length);
      console.log("Cameras to remove:", toRemove.length);
      
      // Add new assignments
      if (toAdd.length > 0) {
        const { error: insertError } = await supabase
          .from('user_camera_access')
          .insert(toAdd);
          
        if (insertError) {
          // Handle infinite recursion errors specifically
          if (insertError.message?.includes('recursion') || insertError.message?.includes('profiles')) {
            console.error("RLS policy recursion error detected:", insertError);
            toast.error("Permission error: Cannot assign cameras due to RLS policy conflict");
            return false;
          }
          
          console.error("Error adding camera assignments:", insertError);
          throw insertError;
        }
      }
      
      // Remove old assignments
      if (toRemove.length > 0) {
        for (const cameraId of toRemove) {
          const { error: deleteError } = await supabase
            .from('user_camera_access')
            .delete()
            .eq('user_id', userId)
            .eq('camera_id', cameraId);
            
          if (deleteError) {
            console.error("Error removing camera assignment:", deleteError);
            // Continue with others even if one fails
          }
        }
      }
      
      toast.success(`Camera assignments updated`);
      return true;
    } catch (error: any) {
      console.error("Error saving camera assignments:", error);
      toast.error(error?.message || "Failed to update camera assignments");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    handleCameraToggle,
    handleSave
  };
}
