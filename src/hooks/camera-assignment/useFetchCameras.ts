
import { useState, useEffect, useRef } from 'react';
import { Camera } from '@/components/admin/camera-assignment/types';
import { toast } from 'sonner';
import { checkAuthentication } from './utils/authCheck';
import { supabase } from '@/integrations/supabase/client';

export function useFetchCameras(userId: string, isOpen: boolean) {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef<number>(0);
  const cacheTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cached camera data with 5-minute expiration
  const cameraCache = useRef<{
    data: Camera[] | null;
    timestamp: number;
    userId: string | null;
  }>({
    data: null,
    timestamp: 0,
    userId: null
  });

  // Load cameras when modal is opened
  useEffect(() => {
    if (isOpen && userId) {
      // Check if we have valid cached data for this user (within last 5 minutes)
      const now = Date.now();
      if (
        cameraCache.current.data && 
        cameraCache.current.userId === userId &&
        now - cameraCache.current.timestamp < 5 * 60 * 1000
      ) {
        setCameras(cameraCache.current.data);
        setLoading(false);
        return;
      }
      
      loadCamerasAndAssignments();
    }
    
    return () => {
      // Clear any pending cache timeout
      if (cacheTimeoutRef.current) {
        clearTimeout(cacheTimeoutRef.current);
      }
    };
  }, [isOpen, userId]);

  const loadCamerasAndAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      lastFetchRef.current = Date.now();
      
      // First check authentication - fast path
      const isAuthenticated = await checkAuthentication();
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      
      // Streamlined parallel fetching for maximum performance
      const [camerasResponse, userCameraResponse] = await Promise.all([
        // Fetch cameras with minimal columns for performance
        supabase
          .from('cameras')
          .select('id, name, location, group')
          .order('name', { ascending: true }),
          
        // Fetch user's assigned cameras
        supabase
          .from('user_camera_access')
          .select('camera_id')
          .eq('user_id', userId)
      ]);
      
      // Handle potential errors
      if (camerasResponse.error) {
        setError("Failed to load cameras: " + camerasResponse.error.message);
        toast.error("Could not load cameras");
        setLoading(false);
        return;
      }
      
      if (userCameraResponse.error) {
        setError("Failed to load assignments: " + userCameraResponse.error.message);
        toast.error("Could not load current assignments");
        setLoading(false);
        return;
      }
      
      const allCameras = camerasResponse.data || [];
      const assignedCameraIds = userCameraResponse.data.map(item => item.camera_id);
      
      if (allCameras.length === 0) {
        setError("No cameras found in system");
        setCameras([]);
        setLoading(false);
        return;
      }
      
      console.log(`Found ${allCameras.length} cameras, user ${userId} has ${assignedCameraIds.length} assigned`);
      
      // Format cameras with assignment information - optimized for speed
      const formattedCameras = allCameras.map(camera => ({
        id: camera.id,
        name: camera.name || 'Unnamed Camera',
        location: camera.location || 'Unknown Location',
        group: camera.group || 'Uncategorized',
        assigned: assignedCameraIds.includes(camera.id)
      }));
      
      // Update state and cache
      setCameras(formattedCameras);
      cameraCache.current = {
        data: formattedCameras,
        timestamp: Date.now(),
        userId
      };
      
      // Set a timeout to invalidate the cache after 5 minutes
      if (cacheTimeoutRef.current) {
        clearTimeout(cacheTimeoutRef.current);
      }
      
      cacheTimeoutRef.current = setTimeout(() => {
        cameraCache.current.data = null;
      }, 5 * 60 * 1000);
      
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
