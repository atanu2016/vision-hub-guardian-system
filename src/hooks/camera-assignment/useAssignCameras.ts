
import { useFetchCameras } from './useFetchCameras';
import { useAdminPermission } from './useAdminPermission';
import { useCameraOperations } from './useCameraOperations';
import { UseCameraAssignmentReturn } from './types';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';

export function useAssignCameras(userId: string, isOpen: boolean): UseCameraAssignmentReturn {
  const navigate = useNavigate();
  const { canAssignCameras } = useAdminPermission();
  const { cameras, setCameras, loading, error, loadCamerasAndAssignments } = useFetchCameras(userId, isOpen);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { saving, handleCameraToggle, handleSave: operationsSave } = useCameraOperations(userId, cameras, setCameras);
  const { user: authUser } = useAuth();

  // Check authentication status when the component loads and any time isOpen changes
  useEffect(() => {
    const checkAuth = async () => {
      if (!isOpen) return;
      
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth check error:", error);
          setIsAuthenticated(false);
          
          // Redirect to auth page after showing error
          toast.error("Authentication required. Please log in.");
          setTimeout(() => navigate('/auth'), 1500);
          return;
        }
        
        // Set authenticated based on session existence
        const authenticated = !!data.session;
        setIsAuthenticated(authenticated);
        
        if (!authenticated) {
          console.warn("Camera assignment attempted without valid authentication");
          toast.error("Please log in to manage camera assignments");
          // Redirect to auth page
          setTimeout(() => navigate('/auth'), 1500);
        }
      } catch (err) {
        console.error("Authentication check failed:", err);
        setIsAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    };
    
    checkAuth();
  }, [isOpen, navigate, authUser]);

  // Create a wrapper for handleSave that includes the permission check
  const handleSave = async () => {
    // Perform a fresh auth check before save
    const { data } = await supabase.auth.getSession();
    const currentlyAuthenticated = !!data.session;
    
    if (!currentlyAuthenticated) {
      console.warn("Save attempted without authentication");
      toast.error("Authentication required. Please log in again.");
      setTimeout(() => navigate('/auth'), 1000);
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
