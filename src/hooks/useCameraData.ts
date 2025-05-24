
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
        toast({
          title: "System Warning",
          description: "Could not initialize the system. Using fallback data.",
          variant: "destructive"
        });
      }
      
      fetchCameras();
    };
    
    initialize();
  }, []);

  const fetchCameras = async () => {
    setLoading(true);
    try {
      console.log("Fetching cameras from database...");
      const camerasData = await getCameras();
      console.log("Fetched cameras:", camerasData);
      setCameras(camerasData);
    } catch (error) {
      console.error('Error fetching cameras:', error);
      toast({
        title: "Error",
        description: "Could not load cameras from the server. Using cached data.",
        variant: "destructive"
      });
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
      console.log("Adding new camera:", newCamera);
      
      const camera: Camera = {
        ...newCamera,
        id: `cam-${Date.now()}`, 
        lastSeen: new Date().toISOString()
      };
      
      console.log("Saving camera to database...");
      const savedCamera = await saveCamera(camera);
      console.log("Camera saved successfully:", savedCamera);
      
      setCameras(prev => [...prev, savedCamera]);
      toast({
        title: "Success",
        description: `${savedCamera.name} has been added successfully`
      });
      return savedCamera;
    } catch (error) {
      console.error('Error adding camera:', error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Error",
        description: `Could not add camera: ${errorMessage}`,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Delete camera function
  const handleDeleteCamera = async (cameraId: string) => {
    try {
      await deleteCamera(cameraId);
      setCameras(prev => prev.filter(camera => camera.id !== cameraId));
      toast({
        title: "Success",
        description: "Camera has been removed successfully"
      });
    } catch (error) {
      console.error('Error deleting camera:', error);
      toast({
        title: "Error", 
        description: "Could not delete camera. Please try again.",
        variant: "destructive"
      });
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
