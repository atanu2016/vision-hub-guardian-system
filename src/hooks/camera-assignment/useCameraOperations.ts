
import { useState, useCallback } from 'react';
import { assignCamerasToUser } from '@/services/userManagement/cameraAssignment';
import { Camera } from '@/components/admin/camera-assignment/types';

export function useCameraOperations(
  userId: string, 
  cameras: Camera[], 
  setCameras: React.Dispatch<React.SetStateAction<Camera[]>>
) {
  const [saving, setSaving] = useState(false);

  // Optimized toggle function with O(1) lookup
  const handleCameraToggle = useCallback((cameraId: string) => {
    if (saving) return; // Prevent changes while saving
    
    setCameras(prevCameras => 
      prevCameras.map(camera => 
        camera.id === cameraId 
          ? { ...camera, assigned: !camera.assigned } 
          : camera
      )
    );
  }, [saving, setCameras]);

  // Optimized save function that only sends selected camera IDs
  const handleSave = useCallback(async () => {
    if (!userId) {
      console.error("Cannot save camera assignments: No user ID provided");
      return false;
    }
    
    setSaving(true);
    
    try {
      // Extract only assigned camera IDs for better performance
      const assignedCameraIds = cameras
        .filter(camera => camera.assigned)
        .map(camera => camera.id);
      
      console.log(`Saving ${assignedCameraIds.length} camera assignments for user ${userId}`);
      
      // Send only the IDs to the backend
      const success = await assignCamerasToUser(userId, assignedCameraIds);
      
      return success;
    } catch (error) {
      console.error("Error in camera assignment save operation:", error);
      return false;
    } finally {
      setSaving(false);
    }
  }, [cameras, userId]);

  return {
    saving,
    handleCameraToggle,
    handleSave
  };
}
