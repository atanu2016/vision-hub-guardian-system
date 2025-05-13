
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, SlidersHorizontal } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import CameraGrid from "@/components/cameras/CameraGrid";
import AddCameraModal from "@/components/cameras/AddCameraModal";
import { Camera } from "@/types/camera";
import { useToast } from "@/hooks/use-toast";
import { getCameras, saveCameras, getCameraGroups } from "@/data/mockData";

const Cameras = () => {
  const { toast } = useToast();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Load cameras from storage on component mount
  useEffect(() => {
    setCameras(getCameras());
  }, []);
  
  // Generate groups dynamically based on camera data
  const cameraGroups = useMemo(() => {
    return getCameraGroups();
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

  const handleAddCamera = (newCamera: Omit<Camera, "id">) => {
    // Generate a unique ID
    const camera: Camera = {
      ...newCamera,
      id: `cam-${Date.now()}`,
    };
    
    // Add to cameras list
    const updatedCameras = [...cameras, camera];
    setCameras(updatedCameras);
    
    // Save to storage
    saveCameras(updatedCameras);
    
    toast({
      title: "Camera Added",
      description: `${camera.name} has been added successfully`,
    });
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
        
        <div className="space-y-8">
          {filteredCameraGroups.map((group) => (
            <CameraGrid
              key={group.id}
              cameras={group.cameras}
              title={group.name}
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
