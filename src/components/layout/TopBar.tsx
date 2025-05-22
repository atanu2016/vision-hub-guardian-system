
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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
import { useCameraAdapter } from "@/hooks/useCameraAdapter";
import { supabase } from "@/integrations/supabase/client";

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
  
  const { adaptCameraParams, toCamera } = useCameraAdapter();
  const pageTitle = getPageTitle(location.pathname);
  
  // Load cameras when component mounts
  useEffect(() => {
    const loadCameras = async () => {
      try {
        const { data, error } = await supabase
          .from('cameras')
          .select('*');
          
        if (error) {
          throw error;
        }
        
        if (data) {
          // Format cameras with proper types
          const formattedCameras = data.map(cam => ({
            id: cam.id,
            name: cam.name,
            status: (cam.status as CameraStatus) || 'offline',
            location: cam.location || 'Unknown',
            ipaddress: cam.ipaddress || '',
            lastseen: cam.lastseen || new Date().toISOString(),
            recording: cam.recording === true,
            port: cam.port,
            username: cam.username,
            password: cam.password,
            model: cam.model,
            manufacturer: cam.manufacturer,
            connectiontype: cam.connectiontype,
            thumbnail: cam.thumbnail,
            group: cam.group,
            motiondetection: cam.motiondetection,
            rtmpurl: cam.rtmpurl || '',
            hlsurl: cam.hlsurl || '',
            onvifpath: cam.onvifpath || '',
            quality: cam.quality || '',
            schedule_type: cam.schedule_type || '',
            time_start: cam.time_start || '',
            time_end: cam.time_end || '',
            days_of_week: cam.days_of_week || []
          }) as Camera);
          
          setCameras(formattedCameras);
        }
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
    try {
      // Convert UI props to database format
      const cameraParams = adaptCameraParams(newCamera);
      
      // Save to database
      const { data: savedCamera, error } = await supabase
        .from('cameras')
        .insert(cameraParams)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Ensure the saved camera is properly typed before updating state
      const typedCamera: Camera = {
        ...savedCamera,
        status: (savedCamera.status as CameraStatus) || 'offline',
        rtmpurl: savedCamera.rtmpurl || '',
        hlsurl: savedCamera.hlsurl || '',
        onvifpath: savedCamera.onvifpath || '',
        quality: savedCamera.quality || '',
        schedule_type: savedCamera.schedule_type || '',
        time_start: savedCamera.time_start || '',
        time_end: savedCamera.time_end || '',
        days_of_week: savedCamera.days_of_week || []
      };
      
      // Update local state with the properly typed saved camera
      setCameras(prev => [...prev, typedCamera]);
      
      // Add notification
      addNotification({
        title: "Camera Added",
        message: `${cameraParams.name} has been added successfully`,
        type: "success"
      });
      
      return savedCamera;
    } catch (error) {
      console.error("Failed to add camera:", error);
      addNotification({
        title: "Error Adding Camera",
        message: "An error occurred while adding the camera.",
        type: "error"
      });
      throw error;
    }
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
