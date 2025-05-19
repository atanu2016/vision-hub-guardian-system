
import { useFetchCameras } from './useFetchCameras';
import { useAdminPermission } from './useAdminPermission';
import { useCameraOperations } from './useCameraOperations';
import { UseCameraAssignmentReturn } from './types';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAssignCameras(userId: string, isOpen: boolean): UseCameraAssignmentReturn {
  const { canAssignCameras } = useAdminPermission();
  const { cameras, setCameras, loading, error, loadCamerasAndAssignments } = useFetchCameras(userId, isOpen);
  const { saving, handleCameraToggle, handleSave: operationsSave } = useCameraOperations(userId, cameras, setCameras);

  // Verify authentication when the component loads
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error("Please log in to manage camera assignments");
        console.warn("Camera assignment attempted without authentication");
      }
    };
    
    if (isOpen) {
      checkAuth();
    }
  }, [isOpen]);

  // Create a wrapper for handleSave that includes the permission check
  const handleSave = async () => {
    if (!canAssignCameras) {
      console.warn("Save attempted without camera assignment permission");
      toast.error("You don't have permission to assign cameras");
      return false;
    }
    
    // Check authentication before attempting to save
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      toast.error("Please log in to save camera assignments");
      return false;
    }
    
    return await operationsSave();
  };

  return {
    cameras,
    loading,
    saving,
    canAssignCameras,
    error,
    handleCameraToggle,
    handleSave,
    loadCamerasAndAssignments
  };
}
