
import { useState, useEffect } from 'react';
import { Camera } from '@/components/admin/camera-assignment/types';
import { supabase } from '@/integrations/supabase/client';
import { getUserAssignedCameras } from '@/services/userManagement/cameraAssignment';
import { toast } from 'sonner';

export function useFetchCameras(userId: string, isOpen: boolean) {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load cameras when modal is opened
  useEffect(() => {
    if (isOpen && userId) {
      loadCamerasAndAssignments();
    }
  }, [isOpen, userId]);

  const loadCamerasAndAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Step 1: Get all cameras
      const { data: allCameras, error: camerasError } = await supabase
        .from('cameras')
        .select('id, name, location');
      
      if (camerasError) {
        console.error("Error fetching cameras:", camerasError);
        setError("Failed to load cameras");
        return;
      }
      
      if (!allCameras || allCameras.length === 0) {
        setError("No cameras found in system");
        setCameras([]);
        return;
      }
      
      console.log(`Found ${allCameras.length} cameras in system`);
      
      // Step 2: Get user's assigned cameras
      try {
        const assignedCameraIds = await getUserAssignedCameras(userId);
        console.log(`User ${userId} has ${assignedCameraIds.length} assigned cameras`, assignedCameraIds);
        
        // Step 3: Mark cameras as assigned or not
        const formattedCameras: Camera[] = allCameras.map(camera => ({
          id: camera.id,
          name: camera.name,
          location: camera.location || 'Unknown',
          assigned: assignedCameraIds.includes(camera.id)
        }));
        
        setCameras(formattedCameras);
      } catch (assignmentError) {
        console.error("Error fetching camera assignments:", assignmentError);
        // Still show cameras without assignment data
        const formattedCameras: Camera[] = allCameras.map(camera => ({
          id: camera.id,
          name: camera.name,
          location: camera.location || 'Unknown',
          assigned: false
        }));
        setCameras(formattedCameras);
        toast.error("Could not load current assignments");
      }
    } catch (error: any) {
      console.error("Error in loadCamerasAndAssignments:", error);
      setError("Failed to load camera data");
    } finally {
      setLoading(false);
    }
  };

  return { cameras, setCameras, loading, error };
}
