
import { useState } from 'react';
import { assignCamerasToUser } from '@/services/userManagement/cameraAssignment';
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
    if (!userId) {
      toast.error("No user selected");
      return false;
    }
    
    setSaving(true);
    
    try {
      // Get all cameras that should be assigned
      const camerasToAssign = cameras
        .filter(camera => camera.assigned)
        .map(camera => camera.id);
      
      console.log(`Saving assignments for ${camerasToAssign.length} cameras to user ${userId}`);
      
      // Use the service function to assign cameras
      await assignCamerasToUser(userId, camerasToAssign);
      
      return true;
    } catch (error: any) {
      console.error("Error in camera assignment process:", error);
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
