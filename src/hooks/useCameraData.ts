
import { useState, useEffect, useMemo } from "react";
import { Camera } from "@/types/camera";
import { useToast } from "@/hooks/use-toast";
import { getCameras, saveCamera, deleteCamera } from "@/services/apiService";
import { checkDatabaseSetup } from "@/services/database";
import { toUICamera, toDatabaseCamera, CameraUIProps } from "@/utils/cameraPropertyMapper";

// Sample HLS camera for consistency
const sampleHLSCamera: Camera = {
  id: "sample-hls-1",
  name: "Sample HLS Stream",
  status: "online",
  location: "Demo Location",
  ipaddress: "",
  lastseen: new Date().toISOString(),
  recording: false,
  connectiontype: "hls",
  hlsurl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", // Public HLS test stream
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
        toast({
          title: "Could not initialize the system",
          description: "Using fallback data.",
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
      const camerasData = await getCameras();
      
      // Add sample HLS camera if enabled
      if (includeSampleCamera) {
        // Check if sample camera already exists in the database
        const sampleExists = camerasData.some(camera => 
          camera.id === sampleHLSCamera.id || 
          (camera.hlsurl === sampleHLSCamera.hlsurl && camera.connectiontype === 'hls')
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
      toast({
        title: "Could not load cameras from the server",
        description: "Using cached data.",
        variant: "destructive"
      });
      
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
  const addCamera = async (newCameraUI: Omit<CameraUIProps, "id" | "lastSeen">) => {
    try {
      // Create camera object with UI format but add the missing required properties
      const cameraUI: CameraUIProps = {
        ...newCameraUI,
        id: `cam-${Date.now()}`,
        lastSeen: new Date().toISOString()
      };
      
      // Convert to database format
      const dbCamera = toDatabaseCamera(cameraUI);
      
      // Save to database
      const savedCamera = await saveCamera(dbCamera);
      setCameras(prev => [...prev, savedCamera]);
      toast({
        title: `${savedCamera.name} has been added successfully`,
      });
      return savedCamera;
    } catch (error) {
      console.error('Error adding camera:', error);
      toast({
        title: "Could not add camera",
        description: "Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Delete camera function
  const handleDeleteCamera = async (cameraId: string) => {
    // Don't allow deletion of the sample camera
    if (cameraId === sampleHLSCamera.id) {
      toast({
        title: "Cannot delete sample camera",
        description: "Use the toggle instead.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await deleteCamera(cameraId);
      setCameras(prev => prev.filter(camera => camera.id !== cameraId));
      toast({
        title: "Camera has been removed successfully"
      });
    } catch (error) {
      console.error('Error deleting camera:', error);
      toast({
        title: "Could not delete camera",
        description: "Please try again.",
        variant: "destructive"
      });
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
