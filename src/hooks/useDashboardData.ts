
import { useState, useEffect, useCallback } from "react";
import { getCameras, getSystemStats } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { Camera as CameraType } from "@/types/camera";

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
  
  // Memoize the fetch function to prevent unnecessary rerenders
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Use Promise.all to fetch data in parallel
      const [camerasData, statsData] = await Promise.all([
        getCameras(),
        getSystemStats()
      ]);
      
      setCameras(camerasData);
      setStats(statsData);
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
  }, [toast]);
  
  useEffect(() => {
    // Get initial data
    fetchData();
    
    // Refresh interval - extended to 60 seconds to reduce server load
    const interval = setInterval(fetchData, 60000);
    
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    stats,
    cameras,
    loading,
    fetchData
  };
};
