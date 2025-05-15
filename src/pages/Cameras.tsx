import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, SlidersHorizontal } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import CameraGrid from "@/components/cameras/CameraGrid";
import AddCameraModal from "@/components/cameras/AddCameraModal";
import { Camera } from "@/types/camera";
import { useToast } from "@/hooks/use-toast";
import { getCameras, saveCamera, deleteCamera } from "@/services/apiService";
import { checkDatabaseSetup } from "@/services/databaseService";

const Cameras = () => {
  const { toast } = useToast();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Initialize system and load cameras from API on component mount
  useEffect(() => {
    const initialize = async () => {
      // Initialize the system first to ensure the database is set up
      try {
        await checkDatabaseSetup();
      } catch (error) {
        console.error('Error initializing system:', error);
        toast({
          title: "System Initialization Error",
          description: "Could not initialize the system. Using fallback data.",
          variant: "destructive",
        });
      }
      
      // Then fetch cameras
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
      toast({
        title: "Error loading cameras",
        description: "Could not load cameras from the server. Using cached data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Generate groups dynamically based on camera data
  const cameraGroups = useMemo(() => {
    // Create an empty array of groups
    const groups: { id: string; name: string; cameras: Camera[] }[] = [];
    
    // Group cameras by their group property
    const groupMap: Record<string, Camera[]> = {};
    cameras.forEach(camera => {
      const groupName = camera.group || "Ungrouped";
      if (!groupMap[groupName]) {
        groupMap[groupName] = [];
      }
      groupMap[groupName].push(camera);
    });
    
    // Convert the map to an array of group objects
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

  // Filter cameras based on search query
  const filteredCameraGroups = useMemo(() => {
    if (!searchQuery) return cameraGroups;
    
    return cameraGroups.map(group => ({
      ...group,
      cameras: group.cameras.filter(camera => 
        camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        camera.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (camera.ipAddress && camera.ipAddress.includes(searchQuery)) ||
        (camera.manufacturer && camera.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (camera.model && camera.model.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    })).filter(group => group.cameras.length > 0);
  }, [cameraGroups, searchQuery]);

  const handleAddCamera = async (newCamera: Omit<Camera, "id" | "lastSeen">) => {
    try {
      // Add to cameras list with temporary ID and current timestamp
      const camera: Camera = {
        ...newCamera,
        id: `cam-${Date.now()}`, // Temporary ID that will be replaced by the API
        lastSeen: new Date().toISOString()
      };
      
      // Call API to save the camera
      const savedCamera = await saveCamera(camera);
      
      // Update the local state with the saved camera
      setCameras(prev => [...prev, savedCamera]);
      
      toast({
        title: "Camera Added",
        description: `${savedCamera.name} has been added successfully`,
      });
    } catch (error) {
      console.error('Error adding camera:', error);
      toast({
        title: "Error Adding Camera",
        description: "Could not add camera. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCamera = async (cameraId: string) => {
    try {
      await deleteCamera(cameraId);
      
      // Update local state by removing the deleted camera
      setCameras(prev => prev.filter(camera => camera.id !== cameraId));
      
      toast({
        title: "Camera Deleted",
        description: "Camera has been removed successfully",
      });
    } catch (error) {
      console.error('Error deleting camera:', error);
      toast({
        title: "Error Deleting Camera",
        description: "Could not delete camera. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cameras</h1>
            <p className="text-muted-foreground">
              Manage and configure your camera system
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                placeholder="Search cameras..."
                className="w-full md:w-64 pl-8 bg-secondary/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Camera
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p>Loading cameras...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredCameraGroups.map((group) => (
              <CameraGrid
                key={group.id}
                cameras={group.cameras}
                title={group.name}
                onDeleteCamera={handleDeleteCamera}
              />
            ))}
            
            {filteredCameraGroups.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No cameras found</h3>
                <p className="text-muted-foreground mt-2">
                  {cameras.length === 0 
                    ? "Add a camera to get started" 
                    : "Try adjusting your search or add a new camera"}
                </p>
                <Button 
                  className="mt-4"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Camera
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <AddCameraModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddCamera}
        existingGroups={existingGroups}
      />
    </AppLayout>
  );
};

export default Cameras;
