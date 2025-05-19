
import { useFetchCameras } from './useFetchCameras';
import { useAdminPermission } from './useAdminPermission';
import { useCameraOperations } from './useCameraOperations';
import { UseCameraAssignmentReturn } from './types';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAssignCameras(userId: string, isOpen: boolean): UseCameraAssignmentReturn {
  const { canAssignCameras } = useAdminPermission();
  const { cameras, setCameras, loading, error, loadCamerasAndAssignments } = useFetchCameras(userId, isOpen);
  const { saving, handleCameraToggle, handleSave: operationsSave, isAuthenticated } = useCameraOperations(userId, cameras, setCameras);
  const [authChecked, setAuthChecked] = useState(false);

  // Verify authentication when the component loads
  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        toast.error("Please log in to manage camera assignments");
        console.warn("Camera assignment attempted without authentication");
      }
      setAuthChecked(true);
    };
    
    if (isOpen) {
      checkAuth();
    }
  }, [isOpen]);

  // Create a wrapper for handleSave that includes the permission check
  const handleSave = async () => {
    if (!isAuthenticated) {
      console.warn("Save attempted without authentication");
      toast.error("Authentication required. Please log in again.");
      return false;
    }
    
    if (!canAssignCameras) {
      console.warn("Save attempted without camera assignment permission");
      toast.error("You don't have permission to assign cameras");
      return false;
    }
    
    return await operationsSave();
  };

  return {
    cameras,
    loading,
    saving,
    canAssignCameras,
    isAuthenticated,
    error,
    handleCameraToggle,
    handleSave,
    loadCamerasAndAssignments
  };
}
