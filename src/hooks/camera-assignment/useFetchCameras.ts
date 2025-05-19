
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
        
        // Step 1: Always get all cameras first - this avoids filtering issues with RLS
        let allCameras;
        try {
          // Try with auth user
          const { data, error } = await supabase
            .from('cameras')
            .select('id, name, location');
          
          if (error) {
            throw error;
          }
          
          allCameras = data;
          console.log("Successfully fetched cameras:", allCameras?.length || 0);
        } catch (cameraError: any) {
          console.error("Error fetching cameras:", cameraError);
          if (cameraError.message?.includes("recursion") || cameraError.message?.includes("permission")) {
            setError("Permission error fetching cameras. Please check your database access.");
          } else {
            setError("Failed to load cameras. Please try again later.");
          }
          setCameras([]);
          setLoading(false);
          return;
        }
        
        // Step 2: Get user's camera assignments - fallback to empty array if this fails
        let assignedCameraIds = new Set<string>();
        try {
          const { data: assignmentData, error: assignmentError } = await supabase
            .from('user_camera_access')
            .select('camera_id')
            .eq('user_id', userId);
            
          if (!assignmentError && assignmentData) {
            assignedCameraIds = new Set(assignmentData.map(a => a.camera_id));
            console.log(`User has ${assignedCameraIds.size} assigned cameras`);
          } else {
            console.warn("Could not fetch camera assignments:", assignmentError);
          }
        } catch (assignmentError) {
          console.warn("Error fetching camera assignments:", assignmentError);
          // Continue with empty assignments rather than failing completely
        }
        
        // Step 3: Combine cameras with assignment data
        const camerasWithAssignments = allCameras.map((camera: any) => ({
          ...camera,
          assigned: assignedCameraIds.has(camera.id)
        }));
        
        setCameras(camerasWithAssignments);
        console.log("Camera data processed successfully:", camerasWithAssignments.length);
      } catch (error: any) {
        console.error("Error in fetchCamerasAndAssignments:", error);
        setError(error.message || "Failed to load camera data");
        toast.error("Error loading cameras");
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
