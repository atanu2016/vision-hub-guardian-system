
import { useState, useCallback, useMemo } from 'react';
import { assignCamerasToUser } from '@/services/userManagement/cameraAssignment';
import { Camera } from '@/components/admin/camera-assignment/types';
import { toast } from 'sonner';

export function useCameraOperations(
  userId: string, 
  cameras: Camera[], 
  setCameras: React.Dispatch<React.SetStateAction<Camera[]>>
) {
  const [saving, setSaving] = useState(false);

  // Optimized toggle function with O(1) lookup and memoized handler function
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

  // Memoized assigned camera IDs for instant access during save
  const assignedCameraIds = useMemo(() => {
    return cameras
      .filter(camera => camera.assigned)
      .map(camera => camera.id);
  }, [cameras]);

  // Ultra-optimized save function
  const handleSave = useCallback(async () => {
    if (!userId) {
      console.error("Cannot save camera assignments: No user ID provided");
      return false;
    }
    
    setSaving(true);
    
    try {
      console.log(`Saving ${assignedCameraIds.length} camera assignments for user ${userId}`);
      
      // Send only the IDs to the backend for maximum performance
      const success = await assignCamerasToUser(userId, assignedCameraIds);
      
      if (!success) {
        toast.error("Failed to save camera assignments");
      }
      
      return success;
    } catch (error) {
      console.error("Error in camera assignment save operation:", error);
      return false;
    } finally {
      setSaving(false);
    }
  }, [assignedCameraIds, userId]);

  return {
    saving,
    handleCameraToggle,
    handleSave
  };
}
