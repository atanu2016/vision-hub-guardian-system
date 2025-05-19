
import { useState, useEffect } from 'react';
import { assignCamerasToUser } from '@/services/userManagement/cameraAssignment';
import { Camera } from '@/components/admin/camera-assignment/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export function useCameraOperations(userId: string, cameras: Camera[], setCameras: (cameras: Camera[]) => void) {
  const [saving, setSaving] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check authentication status on init
  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        console.warn("Camera operations attempted without valid authentication");
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    };
    
    checkAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (!session && (event === 'SIGNED_OUT' || event === 'USER_DELETED')) {
        console.log("User signed out during camera operations");
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle checkbox change
  const handleCameraToggle = (cameraId: string, checked: boolean) => {
    if (!isAuthenticated) {
      toast.error("You need to be logged in to assign cameras");
      setTimeout(() => navigate('/auth'), 1000);
      return;
    }
    
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
      setTimeout(() => navigate('/auth'), 1000);
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
