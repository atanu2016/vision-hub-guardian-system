
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
  
  // Save camera assignments with resilient error handling
  const handleSave = async () => {
    setSaving(true);
    
    try {
      console.log(`Saving camera assignments for user ${userId} with ${cameras.length} cameras`);
      
      // Get all cameras that should be assigned
      const camerasToAssign = cameras.filter(c => c.assigned).map(c => c.id);
      
      // Get all cameras that should not be assigned
      const camerasToUnassign = cameras.filter(c => !c.assigned).map(c => c.id);
      
      console.log(`Will assign ${camerasToAssign.length} cameras and unassign ${camerasToUnassign.length} cameras`);
      
      // Get current assignments with resilient query
      let currentAssignments: string[] = [];
      try {
        const { data, error } = await supabase
          .from('user_camera_access')
          .select('camera_id')
          .eq('user_id', userId);
          
        if (!error && data) {
          currentAssignments = data.map(a => a.camera_id);
          console.log(`Current assignments: ${currentAssignments.length} cameras`);
        }
      } catch (fetchErr) {
        console.warn("Error fetching current assignments, proceeding with empty set:", fetchErr);
      }
      
      // Determine what needs to be added and removed
      const toAdd = camerasToAssign.filter(id => !currentAssignments.includes(id));
      const toRemove = camerasToUnassign.filter(id => currentAssignments.includes(id));
      
      console.log(`Changes to process: ${toAdd.length} to add, ${toRemove.length} to remove`);
      
      // Add new assignments - process in small batches of 10 to avoid large transactions
      if (toAdd.length > 0) {
        const batchSize = 10;
        for (let i = 0; i < toAdd.length; i += batchSize) {
          const batch = toAdd.slice(i, i + batchSize);
          const assignments = batch.map(cameraId => ({
            user_id: userId,
            camera_id: cameraId,
            created_at: new Date().toISOString()
          }));
          
          const { error: insertError } = await supabase
            .from('user_camera_access')
            .insert(assignments);
            
          if (insertError) {
            console.error(`Error adding batch ${i/batchSize + 1}:`, insertError);
            // Continue with other batches, don't throw
          }
        }
      }
      
      // Remove old assignments - one by one for better error handling
      let removalErrors = 0;
      for (const cameraId of toRemove) {
        const { error: deleteError } = await supabase
          .from('user_camera_access')
          .delete()
          .eq('user_id', userId)
          .eq('camera_id', cameraId);
          
        if (deleteError) {
          console.error(`Error removing camera ${cameraId}:`, deleteError);
          removalErrors++;
        }
      }
      
      // Show appropriate success message
      if (removalErrors > 0) {
        toast.warning(`Camera assignments updated with ${removalErrors} errors`);
      } else {
        toast.success(`Camera assignments updated successfully`);
      }
      
      return true;
    } catch (error: any) {
      console.error("Error in camera assignment process:", error);
      toast.error("Failed to update camera assignments");
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
