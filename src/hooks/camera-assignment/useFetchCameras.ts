
import { useState, useEffect, useRef } from 'react';
import { Camera } from '@/components/admin/camera-assignment/types';
import { toast } from 'sonner';
import { cameraCache, isCacheValid, updateCache } from './utils/cameraCache';
import { checkAuthentication } from './utils/authCheck';
import { 
  fetchAllCameras, 
  formatCamerasWithAssignments, 
  fetchUserAssignments 
} from './utils/cameraFetching';
import { supabase } from '@/integrations/supabase/client';

export function useFetchCameras(userId: string, isOpen: boolean) {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef<number>(0);

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
      
      // First check authentication
      const isAuthenticated = await checkAuthentication();
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      
      // Do an explicit refresh of the session token before proceeding
      try {
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.warn("Token refresh warning:", refreshError);
          // Continue without refresh as a fallback
        } else {
          console.log("Session refreshed successfully before camera fetch");
        }
      } catch (refreshErr) {
        console.warn("Error refreshing token (non-fatal):", refreshErr);
        // Continue with existing token - it might still work
      }
      
      // Fetch all cameras using direct database query for maximum reliability
      const { data: allCameras, error: camerasError } = await supabase
        .from('cameras')
        .select('id, name, location, group')
        .order('name', { ascending: true });
      
      if (camerasError) {
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
      
      // Get user's assigned cameras
      const { data: userCameraData, error: userCameraError } = await supabase
        .from('user_camera_access')
        .select('camera_id')
        .eq('user_id', userId);
        
      if (userCameraError) {
        console.error("Error fetching camera assignments:", userCameraError);
        toast.error("Could not load current assignments");
      }
      
      // Extract assigned camera IDs
      const assignedCameraIds = userCameraData ? userCameraData.map(item => item.camera_id) : [];
      
      console.log(`User ${userId} has ${assignedCameraIds.length} assigned cameras`);
      
      // Format cameras with assignment information
      const formattedCameras = allCameras.map(camera => ({
        id: camera.id,
        name: camera.name || 'Unnamed Camera',
        location: camera.location || 'Unknown Location',
        group: camera.group || 'Uncategorized',
        assigned: assignedCameraIds.includes(camera.id)
      }));
      
      setCameras(formattedCameras);
      
      // Update cache
      updateCache(userId, formattedCameras, assignedCameraIds);
      
      // Update last fetch time
      lastFetchRef.current = Date.now();
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
