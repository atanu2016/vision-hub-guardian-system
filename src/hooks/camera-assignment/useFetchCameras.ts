
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Camera } from '@/components/admin/camera-assignment/types';
import { getCameraCount } from '@/services/database/camera/checkCamerasExist';
import { toast } from 'sonner';

export function useFetchCameras(userId: string, isOpen: boolean) {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch cameras and user's assigned cameras when modal opens
  useEffect(() => {
    if (!isOpen || !userId) return;
    
    const fetchCamerasAndAssignments = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching cameras and assignments for user:", userId);
        
        // First check if we have any cameras in the system at all
        const cameraCount = await getCameraCount();
        
        if (cameraCount === 0) {
          console.log("No cameras found in the system");
          setCameras([]);
          setLoading(false);
          return;
        }
        
        // Direct query for all cameras to avoid RLS issues
        const { data: allCameras, error: camerasError } = await supabase
          .from('cameras')
          .select('id, name, location');
        
        if (camerasError) {
          if (camerasError.message?.includes('infinite recursion')) {
            setError("Permission error: There's an RLS policy conflict. Please contact system administrator.");
            console.error("RLS recursion error:", camerasError);
            setCameras([]);
            return;
          }
          
          console.error("Error fetching cameras:", camerasError);
          throw camerasError;
        }
        
        console.log("All cameras fetched:", allCameras?.length || 0);
        
        // Fetch user's assigned cameras with error handling for RLS
        let userCameras = [];
        try {
          const { data: accessData, error: accessError } = await supabase
            .from('user_camera_access')
            .select('camera_id')
            .eq('user_id', userId);
            
          if (accessError) {
            console.warn("Error fetching user camera assignments:", accessError);
            // Continue with empty assignments rather than failing completely
          } else {
            userCameras = accessData || [];
          }
        } catch (assignmentError) {
          console.warn("Failed to get camera assignments:", assignmentError);
          // Continue with empty assignments
        }
        
        console.log("User camera assignments fetched:", userCameras?.length || 0);
        
        // Create a set of assigned camera IDs for quick lookup
        const assignedCameraIds = new Set(userCameras?.map(uc => uc.camera_id) || []);
        
        // Combine data
        const camerasWithAssignments = allCameras?.map(camera => ({
          ...camera,
          assigned: assignedCameraIds.has(camera.id)
        })) || [];
        
        console.log("Combined cameras with assignments:", camerasWithAssignments.length);
        setCameras(camerasWithAssignments);
      } catch (error: any) {
        console.error("Error fetching cameras:", error);
        
        // Special handling for known errors
        if (error.message?.includes('infinite recursion')) {
          setError("Database permission error. Please contact your system administrator.");
        } else {
          setError(error?.message || "Failed to load cameras");
        }
        
        toast.error("Failed to load cameras");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCamerasAndAssignments();
  }, [isOpen, userId]);

  return {
    cameras,
    setCameras,
    loading,
    error
  };
}
