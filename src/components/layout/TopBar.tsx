
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getCameras, saveCamera } from "@/data/mockData";
import { Camera, CameraStatus } from "@/types/camera";
import { useNotifications } from "@/hooks/useNotifications";
import SearchBar from "@/components/search/SearchBar";
import UserMenu from "./topbar/UserMenu";
import NotificationsButton from "./topbar/NotificationsButton";
import AddCameraButton from "./topbar/AddCameraButton";
import ThemeToggleButton from "./topbar/ThemeToggleButton";
import MobileSidebarToggle from "./topbar/MobileSidebarToggle";
import { getPageTitle } from "@/lib/navigation";
import { CameraUIProps } from "@/utils/cameraPropertyMapper";

const TopBar = () => {
  const location = useLocation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    clearAll, 
    addNotification 
  } = useNotifications();
  
  const pageTitle = getPageTitle(location.pathname);
  
  // Load cameras when component mounts
  useEffect(() => {
    const loadCameras = async () => {
      try {
        const loadedCameras = await getCameras();
        setCameras(loadedCameras);
      } catch (error) {
        console.error("Failed to load cameras:", error);
      }
    };
    
    loadCameras();
  }, []);
  
  // Generate groups dynamically based on camera data
  const existingGroups = Array.from(new Set(cameras.map(c => c.group || "Ungrouped")))
    .filter(group => group !== "Ungrouped");

  // Adapt the handleAddCamera function to handle CameraUIProps
  const handleAddCamera = async (newCamera: Omit<CameraUIProps, "id" | "lastSeen">) => {
    // Convert UI props to database format
    const camera: Omit<Camera, "id"> = {
      name: newCamera.name,
      ipaddress: newCamera.ipAddress,
      port: newCamera.port,
      username: newCamera.username,
      password: newCamera.password,
      location: newCamera.location,
      status: newCamera.status as CameraStatus,
      lastseen: new Date().toISOString(),
      recording: newCamera.recording,
      motiondetection: newCamera.motionDetection,
      rtmpurl: newCamera.rtmpUrl,
      hlsurl: newCamera.hlsUrl,
      onvifpath: newCamera.onvifPath,
      connectiontype: newCamera.connectionType,
      group: newCamera.group,
      thumbnail: newCamera.thumbnail,
      manufacturer: newCamera.manufacturer,
      model: newCamera.model
    };
    
    // Save to database
    const savedCamera = await saveCamera(camera as Camera);
    
    // Update local state
    setCameras(prev => [...prev, savedCamera]);
    
    // Add notification
    addNotification({
      title: "Camera Added",
      message: `${camera.name} has been added successfully`,
      type: "success"
    });
    
    return savedCamera;
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-vision-dark-900 dark:border-vision-dark-800">
      <div className="flex h-16 items-center px-4 md:px-6 gap-4">
        <MobileSidebarToggle />
        
        <div className="flex-1">
          <h1 className="text-xl font-semibold">{pageTitle}</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex">
            <SearchBar />
          </div>
          
          <div className="hidden md:flex">
            <ThemeToggleButton />
          </div>
          
          <NotificationsButton 
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onClearAll={clearAll}
          />
          
          {location.pathname.includes('/cameras') && (
            <AddCameraButton 
              isOpen={isAddModalOpen}
              setIsOpen={setIsAddModalOpen}
              onAddCamera={handleAddCamera}
              existingGroups={existingGroups}
            />
          )}
          
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default TopBar;
