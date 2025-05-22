
import { useState, useEffect } from "react";
import { Camera } from "@/types/camera";
import { getCameras } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import { toUICamera } from "@/utils/cameraPropertyMapper";

export function useDashboardData() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Stats derived from cameras
  const stats = {
    totalCameras: cameras.length,
    onlineCameras: cameras.filter(cam => cam.status === 'online').length,
    offlineCameras: cameras.filter(cam => cam.status === 'offline').length,
    recordingCameras: cameras.filter(cam => cam.recording).length
  };

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch cameras
        const camerasData = await getCameras();
        
        // Simulate checking camera streams
        const updatedCameras = await Promise.all(
          camerasData.map(async (camera) => {
            // Convert to UI format for easier use
            const cameraUI = toUICamera(camera);
            
            // For online cameras, check if stream is available
            if (camera.status === 'online') {
              const hasStreamUrl = Boolean(cameraUI.rtmpUrl?.length > 0 || cameraUI.hlsUrl?.length > 0);
              
              // Simulate a check (in real app, would test the stream)
              if (!hasStreamUrl) {
                return {
                  ...camera,
                  status: 'offline' as 'online' | 'offline' | 'recording'
                };
              }
            }
            return camera;
          })
        );
        
        setCameras(updatedCameras);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
        toast({
          title: "Error loading dashboard data",
          description: "Please try refreshing the page",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return {
    cameras,
    stats,
    loading,
    error
  };
}
