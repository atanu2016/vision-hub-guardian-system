
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
      
      // Check cache first
      const cacheKey = userId;
      if (isCacheValid(cacheKey, lastFetchRef.current)) {
        console.log('Using cached camera data');
        const cachedData = cameraCache.get(cacheKey);
        if (cachedData) {
          setCameras(cachedData.cameras);
          setLoading(false);
          return;
        }
      }
      
      // Fetch all cameras
      const { data: allCameras, error: camerasError } = await fetchAllCameras();
      
      if (camerasError) {
        setError("Failed to load cameras: " + camerasError);
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
      const assignedCameraIds = await fetchUserAssignments(userId);
      
      // Format cameras with assignment information
      const formattedCameras = formatCamerasWithAssignments(allCameras, assignedCameraIds);
      
      setCameras(formattedCameras);
      
      // Update cache
      updateCache(cacheKey, formattedCameras, assignedCameraIds);
      
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
