
import { useState, useEffect } from 'react';
import { assignCamerasToUser } from '@/services/userManagement/cameraAssignment';
import { Camera } from '@/components/admin/camera-assignment/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function useCameraOperations(userId: string, cameras: Camera[], setCameras: (cameras: Camera[]) => void) {
  const [saving, setSaving] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on init and periodically
  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      
      if (error || !data.session) {
        console.warn("Camera operations attempted without valid authentication");
      }
    };
    
    checkAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
    
    // Check authentication status before save
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      toast.error("Authentication required. Please log in again.");
      return false;
    }
    
    setSaving(true);
    
    try {
      // Get all cameras that should be assigned
      const camerasToAssign = cameras
        .filter(camera => camera.assigned)
        .map(camera => camera.id);
      
      console.log(`Saving ${camerasToAssign.length} camera assignments for user ${userId}`);
      
      // Use the service function to assign cameras
      const success = await assignCamerasToUser(userId, camerasToAssign);
      
      if (success) {
        toast.success("Camera assignments saved successfully");
      }
      return success;
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
    isAuthenticated,
    handleCameraToggle,
    handleSave
  };
}
