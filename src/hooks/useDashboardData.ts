
import { useState, useEffect } from "react";
import { getCameras, getSystemStats } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { Camera as CameraType } from "@/types/camera";

export const useDashboardData = () => {
  const [stats, setStats] = useState<any>({
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
  
  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch cameras
      const camerasData = await getCameras();
      setCameras(camerasData);
      
      // Fetch system stats
      const statsData = await getSystemStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error fetching data",
        description: "Could not connect to the server. Using cached data instead.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Get initial data
    fetchData();
    
    // Set up refresh interval
    const interval = setInterval(() => {
      fetchData();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    cameras,
    loading,
    fetchData
  };
};
