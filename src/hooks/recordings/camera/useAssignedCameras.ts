
import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import { Camera } from "../types";

/**
 * Hook to fetch cameras assigned to the user based on their role
 */
export const useAssignedCameras = (userId?: string, userRole?: string) => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip loading if no user ID
    if (!userId) {
      return;
    }
    
    const loadCameras = async () => {
      setLoading(true);
      
      try {
        // For observers, get only assigned cameras
        if (userRole === 'observer') {
          // Fetch camera details for assigned cameras
          const { data: cameraData, error: cameraError } = await supabase
            .from('cameras')
            .select('id, name');
            
          if (cameraError) {
            console.error("Error fetching assigned cameras:", cameraError);
            return;
          }
          
          // Transform to expected format
          if (cameraData) {
            const uniqueCameras = cameraData.map(cam => ({
              id: cam.id,
              name: cam.name
            } as Camera));
            
            setCameras(uniqueCameras);
          }
        } else {
          // For non-observers (admin, etc.), show all cameras
          // Fetch all cameras from database or use mock data
          const { data: cameraData, error: cameraError } = await supabase
            .from('cameras')
            .select('id, name');
            
          if (cameraError) {
            console.error("Error fetching cameras:", cameraError);
            // Fall back to mock data in case of error
            const uniqueCameras = extractUniqueCamerasFromMock();
            setCameras(uniqueCameras);
            return;
          }
          
          if (cameraData && cameraData.length > 0) {
            const uniqueCameras = cameraData.map(cam => ({
              id: cam.id,
              name: cam.name
            } as Camera));
            
            setCameras(uniqueCameras);
          } else {
            // Fallback to mock data if no cameras in database
            const uniqueCameras = extractUniqueCamerasFromMock();
            setCameras(uniqueCameras);
          }
        }
      } catch (error) {
        console.error("Error loading camera access data:", error);
        // Fallback to mock data
        const uniqueCameras = extractUniqueCamerasFromMock();
        setCameras(uniqueCameras);
      } finally {
        setLoading(false);
      }
    };

    loadCameras();
  }, [userRole, userId]);
  
  // Helper function to extract unique cameras from mock data
  const extractUniqueCamerasFromMock = () => {
    // Import done inside function to avoid circular dependencies
    const { mockRecordings } = require('../mockData');
    return Array.from(new Set(mockRecordings.map(r => r.cameraName)))
      .map(name => {
        // Ensure type safety: cast 'name' to string before using toLowerCase
        const cameraName = String(name);
        return {
          id: cameraName.toLowerCase().replace(/\s+/g, '-'),
          name: cameraName
        } as Camera;
      });
  };

  return {
    cameras,
    loading
  };
};
