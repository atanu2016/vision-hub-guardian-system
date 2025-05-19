
import { useFetchCameras } from './useFetchCameras';
import { useAdminPermission } from './useAdminPermission';
import { useCameraOperations } from './useCameraOperations';
import { UseCameraAssignmentReturn } from './types';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCameraGroups } from './useCameraGroups';

export function useAssignCameras(userId: string, isOpen: boolean): UseCameraAssignmentReturn {
  const { canAssignCameras } = useAdminPermission();
  const { cameras, setCameras, loading, error, loadCamerasAndAssignments } = useFetchCameras(userId, isOpen);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { saving, handleCameraToggle, handleSave: operationsSave } = useCameraOperations(userId, cameras, setCameras);
  const { groupedCameras, getAvailableGroups, getCamerasByGroup } = useCameraGroups(cameras);

  // Check authentication status when the component loads and any time isOpen changes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth check error:", error);
          setIsAuthenticated(false);
          toast.error("Authentication error. Please log in again.");
        } else {
          // Set authenticated based on session existence
          const authenticated = !!data.session;
          setIsAuthenticated(authenticated);
          
          if (!authenticated) {
            console.warn("Camera assignment attempted without valid authentication");
            toast.error("Please log in to manage camera assignments");
          }
        }
      } catch (err) {
        console.error("Authentication check failed:", err);
        setIsAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    };
    
    if (isOpen) {
      checkAuth();
    }
  }, [isOpen]);

  // Create a wrapper for handleSave that includes the permission check
  const handleSave = async () => {
    // Perform a fresh auth check before save to ensure we have the latest status
    const { data } = await supabase.auth.getSession();
    const currentlyAuthenticated = !!data.session;
    
    if (!currentlyAuthenticated) {
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
    groupedCameras,
    getAvailableGroups,
    getCamerasByGroup,
    error,
    handleCameraToggle,
    handleSave,
    loadCamerasAndAssignments
  };
}
