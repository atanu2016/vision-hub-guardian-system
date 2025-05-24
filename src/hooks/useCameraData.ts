
import { useState, useEffect, useMemo } from "react";
import { Camera } from "@/types/camera";
import { useToast } from "@/hooks/use-toast";
import { getCameras, saveCamera, deleteCamera } from "@/services/apiService";
import { checkDatabaseSetup } from "@/services/database";

export function useCameraData() {
  const { toast } = useToast();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Initialize system and load cameras
  useEffect(() => {
    const initialize = async () => {
      try {
        await checkDatabaseSetup();
      } catch (error) {
        console.error('Error initializing system:', error);
        toast.error("Could not initialize the system. Using fallback data.");
      }
      
      fetchCameras();
    };
    
    initialize();
  }, []);

  const fetchCameras = async () => {
    setLoading(true);
    try {
      const camerasData = await getCameras();
      setCameras(camerasData);
    } catch (error) {
      console.error('Error fetching cameras:', error);
      toast.error("Could not load cameras from the server. Using cached data.");
      setCameras([]);
    } finally {
      setLoading(false);
    }
  };

  // Group cameras by their group property
  const cameraGroups = useMemo(() => {
    const groups: { id: string; name: string; cameras: Camera[] }[] = [];
    
    const groupMap: Record<string, Camera[]> = {};
    cameras.forEach(camera => {
      const groupName = camera.group || "Ungrouped";
      if (!groupMap[groupName]) {
        groupMap[groupName] = [];
      }
      groupMap[groupName].push(camera);
    });
    
    Object.entries(groupMap).forEach(([name, groupCameras]) => {
      groups.push({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        cameras: groupCameras
      });
    });
    
    return groups;
  }, [cameras]);
  
  // Get unique group names for the dropdown
  const existingGroups = useMemo(() => {
    return Array.from(new Set(cameras.map(c => c.group || "Ungrouped")))
      .filter(group => group !== "Ungrouped");
  }, [cameras]);

  // Add camera function
  const addCamera = async (newCamera: Omit<Camera, "id" | "lastSeen">) => {
    try {
      const camera: Camera = {
        ...newCamera,
        id: `cam-${Date.now()}`, 
        lastSeen: new Date().toISOString()
      };
      
      const savedCamera = await saveCamera(camera);
      setCameras(prev => [...prev, savedCamera]);
      toast.success(`${savedCamera.name} has been added successfully`);
      return savedCamera;
    } catch (error) {
      console.error('Error adding camera:', error);
      toast.error("Could not add camera. Please try again.");
      throw error;
    }
  };

  // Delete camera function
  const handleDeleteCamera = async (cameraId: string) => {
    try {
      await deleteCamera(cameraId);
      setCameras(prev => prev.filter(camera => camera.id !== cameraId));
      toast.success("Camera has been removed successfully");
    } catch (error) {
      console.error('Error deleting camera:', error);
      toast.error("Could not delete camera. Please try again.");
    }
  };

  return {
    cameras,
    loading,
    cameraGroups,
    existingGroups,
    fetchCameras,
    addCamera,
    handleDeleteCamera
  };
}
