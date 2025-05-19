
import { useState, useEffect, useMemo } from "react";
import { Camera } from "@/types/camera";
import { useToast } from "@/hooks/use-toast";
import { getCameras, saveCamera, deleteCamera } from "@/services/apiService";
import { checkDatabaseSetup } from "@/services/database";

// Sample HLS camera for consistency
const sampleHLSCamera: Camera = {
  id: "sample-hls-1",
  name: "Sample HLS Stream",
  status: "online",
  location: "Demo Location",
  ipAddress: "",
  lastSeen: new Date().toISOString(),
  recording: false,
  connectionType: "hls",
  hlsUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", // Public HLS test stream
  group: "Demo"
};

export function useCameraData() {
  const { toast } = useToast();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [includeSampleCamera, setIncludeSampleCamera] = useState(true);
  
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
      
      // Add sample HLS camera if enabled
      if (includeSampleCamera) {
        // Check if sample camera already exists in the database
        const sampleExists = camerasData.some(camera => 
          camera.id === sampleHLSCamera.id || 
          (camera.hlsUrl === sampleHLSCamera.hlsUrl && camera.connectionType === 'hls')
        );
        
        if (!sampleExists) {
          setCameras([...camerasData, sampleHLSCamera]);
        } else {
          setCameras(camerasData);
        }
      } else {
        setCameras(camerasData);
      }
    } catch (error) {
      console.error('Error fetching cameras:', error);
      toast.error("Could not load cameras from the server. Using cached data.");
      
      // Still show the sample camera if there's an error
      if (includeSampleCamera) {
        setCameras([sampleHLSCamera]);
      } else {
        setCameras([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle the sample camera
  const toggleSampleCamera = () => {
    setIncludeSampleCamera(prev => !prev);
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
    // Don't allow deletion of the sample camera
    if (cameraId === sampleHLSCamera.id) {
      toast.error("Cannot delete sample camera. Use the toggle instead.");
      return;
    }
    
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
    includeSampleCamera,
    toggleSampleCamera,
    cameraGroups,
    existingGroups,
    fetchCameras,
    addCamera,
    handleDeleteCamera
  };
}
