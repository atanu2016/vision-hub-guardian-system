
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getCameras, saveCamera } from "@/data/mockData";
import { Camera } from "@/types/camera";
import { useNotifications } from "@/hooks/useNotifications";
import SearchBar from "@/components/search/SearchBar";
import UserMenu from "./topbar/UserMenu";
import NotificationsButton from "./topbar/NotificationsButton";
import AddCameraButton from "./topbar/AddCameraButton";
import ThemeToggleButton from "./topbar/ThemeToggleButton";
import MobileSidebarToggle from "./topbar/MobileSidebarToggle";
import { getPageTitle } from "@/lib/navigation";

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
    saveCamera(camera);
    
    // Add notification
    addNotification({
      title: "Camera Added",
      message: `${camera.name} has been added successfully`,
      type: "success"
    });
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
