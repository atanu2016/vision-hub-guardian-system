
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Camera } from '@/components/admin/camera-assignment/types';

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
        
        // Step 1: Get all cameras
        const { data: allCameras, error: camerasError } = await supabase
          .from('cameras')
          .select('id, name, location');
          
        if (camerasError) {
          throw camerasError;
        }
        
        if (!allCameras || allCameras.length === 0) {
          console.log("No cameras found in the system");
          setCameras([]);
          setLoading(false);
          return;
        }
        
        console.log(`Successfully fetched ${allCameras.length} cameras`);
        
        // Step 2: Get user's camera assignments
        const { data: assignmentData, error: assignmentError } = await supabase
          .from('user_camera_access')
          .select('camera_id')
          .eq('user_id', userId);
          
        if (assignmentError) {
          console.error("Error fetching camera assignments:", assignmentError);
          // Continue with empty assignments rather than failing completely
        }
        
        // Create a Set of assigned camera IDs for efficient lookup
        const assignedCameraIds = new Set(assignmentData?.map(a => a.camera_id) || []);
        console.log(`User has ${assignedCameraIds.size} assigned cameras:`, Array.from(assignedCameraIds));
        
        // Step 3: Combine cameras with assignment data
        const camerasWithAssignments = allCameras.map(camera => ({
          ...camera,
          assigned: assignedCameraIds.has(camera.id)
        }));
        
        setCameras(camerasWithAssignments);
        console.log("Camera data processed successfully:", camerasWithAssignments.length);
      } catch (error: any) {
        console.error("Error in fetchCamerasAndAssignments:", error);
        setError(error.message || "Failed to load camera data");
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
