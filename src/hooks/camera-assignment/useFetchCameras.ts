
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
      
      // Check for valid session before making any requests
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        console.error("Authentication error when fetching cameras:", sessionError || "No active session");
        setError("Authentication required. Please log in again.");
        toast.error("Please log in to access camera assignments");
        setTimeout(() => {
          // Redirect to auth page
          window.location.href = '/auth';
        }, 1500);
        setLoading(false);
        return;
      }
      
      // Step 1: Get all cameras with reliable error handling
      const { data: allCameras, error: camerasError } = await supabase
        .from('cameras')
        .select('id, name, location, group')
        .order('name', { ascending: true });
      
      if (camerasError) {
        console.error("Error fetching cameras:", camerasError);
        setError("Failed to load cameras: " + camerasError.message);
        toast.error("Could not load cameras");
        setLoading(false);
        return;
      }
      
      if (!allCameras || allCameras.length === 0) {
        setError("No cameras found in system");
        setCameras([]);
        setLoading(false);
        return;
      }
      
      console.log(`Found ${allCameras.length} cameras in system`);
      
      // Step 2: Get user's assigned cameras
      let assignedCameraIds: string[] = [];
      try {
        assignedCameraIds = await getUserAssignedCameras(userId);
        console.log(`User ${userId} has ${assignedCameraIds.length} assigned cameras`);
      } catch (assignmentError: any) {
        console.error("Error fetching camera assignments:", assignmentError);
        toast.error("Could not load current assignments. Will start with empty selection.");
        // Continue with empty assignments rather than returning
      }
      
      // Step 3: Mark cameras as assigned or not
      const formattedCameras: Camera[] = allCameras.map(camera => ({
        id: camera.id,
        name: camera.name || 'Unnamed Camera',
        location: camera.location || 'Unknown Location',
        group: camera.group || 'Uncategorized',
        assigned: assignedCameraIds.includes(camera.id)
      }));
      
      setCameras(formattedCameras);
    } catch (error: any) {
      console.error("Error in loadCamerasAndAssignments:", error);
      setError("Failed to load camera data: " + (error?.message || "Unknown error"));
      toast.error(error?.message || "Could not load camera data");
    } finally {
      setLoading(false);
    }
  };

  return { cameras, setCameras, loading, error, loadCamerasAndAssignments };
}
