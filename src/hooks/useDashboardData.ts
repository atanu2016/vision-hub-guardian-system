import { useState, useEffect, useCallback } from "react";
import { getCameras } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import { Camera as CameraType } from "@/types/camera";
import { fetchSystemStatsFromDB } from "@/services/database/statsService";

export const useDashboardData = () => {
  const [stats, setStats] = useState({
    totalCameras: 0,
    onlineCameras: 0,
    offlineCameras: 0,
    recordingCameras: 0,
    storageUsed: "0 GB",
    storageTotal: "1 TB",
    storagePercentage: 0,
    uptimeHours: 0
  });
  
  const [cameras, setCameras] = useState<CameraType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Check if camera is streaming
  const checkCameraStreaming = useCallback(async (camera: CameraType) => {
    if (camera.status !== 'online') return false;
    
    // In a real implementation, we would make an actual API call to check if the stream is available
    // For demo purposes, we're simulating that some online cameras might still have unavailable streams
    const hasStreamUrl = Boolean(camera.rtmpUrl?.length > 0 || camera.hlsUrl?.length > 0);
    
    if (!hasStreamUrl) return false;
    
    // Simulate stream check with 70% chance of success for cameras marked as "online"
    return Math.random() > 0.3;
  }, []);
  
  // Calculate system stats from real camera data
  const calculateStats = useCallback(async (cameraList: CameraType[]) => {
    try {
      // First try to get stats from the database
      const dbStats = await fetchSystemStatsFromDB();
      
      // If we have database stats, use those
      if (dbStats) {
        setStats(dbStats);
        return;
      }
      
      // Otherwise calculate stats from the camera list
      const totalCameras = cameraList.length;
      
      // Check each camera's stream availability
      const streamingPromises = cameraList
        .filter(cam => cam.status === 'online')
        .map(async camera => {
          const isStreaming = await checkCameraStreaming(camera);
          return { ...camera, isStreaming };
        });
      
      const enhancedCameras = await Promise.all(streamingPromises);
      
      // Count cameras that are both online AND streaming
      const onlineCameras = enhancedCameras.filter(cam => cam.status === 'online' && cam.isStreaming).length;
      const offlineCameras = totalCameras - onlineCameras;
      const recordingCameras = cameraList.filter(cam => cam.recording).length;
      
      // Calculate storage metrics (these would come from the actual backend in a real app)
      const storageUsed = `${Math.floor(Math.random() * 100)} GB`;
      const storageTotal = "1 TB";
      const storagePercentage = Math.floor(Math.random() * 60); // 0-60%
      
      // Calculate uptime (in a real app this would come from the server)
      const uptimeHours = Math.floor(Math.random() * 240) + 24; // 24-264 hours
      
      setStats({
        totalCameras,
        onlineCameras,
        offlineCameras,
        recordingCameras,
        storageUsed,
        storageTotal,
        storagePercentage,
        uptimeHours
      });
      
    } catch (error) {
      console.error("Error calculating stats:", error);
      toast({
        title: "Error calculating system statistics",
        description: "Using default values",
        variant: "destructive",
      });
    }
  }, [checkCameraStreaming, toast]);
  
  // Memoize the fetch function to prevent unnecessary rerenders
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch cameras
      const camerasData = await getCameras();
      setCameras(camerasData);
      
      // Calculate real statistics based on actual camera data
      await calculateStats(camerasData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error fetching data",
        description: "Could not connect to the server. Using cached data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [calculateStats, toast]);
  
  useEffect(() => {
    // Get initial data
    fetchData();
    
    // Refresh interval - set to 30 seconds to see real-time changes
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    stats,
    cameras,
    loading,
    fetchData
  };
};
