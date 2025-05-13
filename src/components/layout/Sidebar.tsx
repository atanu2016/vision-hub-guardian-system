
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import {
  Camera as CameraIcon,
  Home,
  Settings,
  Bell,
  Archive,
  PlaySquare,
  Layers,
  ChevronRight,
  HardDrive,
  User,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const Sidebar = () => {
  const location = useLocation();
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(
    location.pathname.startsWith("/settings") || 
    location.pathname.startsWith("/settings/recordings") || 
    location.pathname.startsWith("/settings/alerts") || 
    location.pathname.startsWith("/settings/storage")
  );

  // Update expanded state when route changes
  useEffect(() => {
    setIsSettingsExpanded(
      location.pathname.startsWith("/settings") || 
      location.pathname.startsWith("/settings/recordings") || 
      location.pathname.startsWith("/settings/alerts") || 
      location.pathname.startsWith("/settings/storage")
    );
  }, [location.pathname]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Get camera groups from localStorage
  const [cameraGroups, setCameraGroups] = useState<string[]>([]);
  
  useEffect(() => {
    const getCameraGroupsFromStorage = () => {
      const storedCameras = localStorage.getItem('cameras');
      if (storedCameras) {
        const cameras = JSON.parse(storedCameras);
        const groups = Array.from(new Set(cameras.map((c: any) => c.group || "Ungrouped")))
          .filter((group: string) => group !== "Ungrouped");
        setCameraGroups(groups);
      }
    };
    
    // Get initial groups
    getCameraGroupsFromStorage();
    
    // Set up listener for changes
    window.addEventListener('storage', getCameraGroupsFromStorage);
    
    // Clean up
    return () => {
      window.removeEventListener('storage', getCameraGroupsFromStorage);
    };
  }, []);

  return (
    <SidebarComponent>
      <SidebarHeader className="px-4 py-6">
        <div className="flex items-center space-x-2">
          <div className="bg-vision-blue-500 p-1 rounded">
            <CameraIcon size={24} className="text-white" />
          </div>
          <h2 className="text-xl font-bold">Vision Hub</h2>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/")}>
                  <Link to="/">
                    <Home />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/cameras")}>
                  <Link to="/cameras">
                    <CameraIcon />
                    <span>Cameras</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setIsSettingsExpanded(!isSettingsExpanded)} 
                  isActive={
                    location.pathname.startsWith("/settings")
                  }
                >
                  <Settings />
                  <span>Settings</span>
                  <ChevronRight 
                    className={`ml-auto h-4 w-4 transition-transform ${isSettingsExpanded ? "rotate-90" : ""}`} 
                  />
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {isSettingsExpanded && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive("/settings")}
                      className="pl-8"
                    >
                      <Link to="/settings">
                        <Settings />
                        <span>General Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive("/settings/recordings")}
                      className="pl-8"
                    >
                      <Link to="/settings/recordings">
                        <PlaySquare />
                        <span>Recordings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive("/settings/alerts")}
                      className="pl-8"
                    >
                      <Link to="/settings/alerts">
                        <Bell />
                        <span>Alerts</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive("/settings/storage")}
                      className="pl-8"
                    >
                      <Link to="/settings/storage">
                        <HardDrive />
                        <span>Storage</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive("/profile-settings")}
                >
                  <Link to="/profile-settings">
                    <User />
                    <span>Profile Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {cameraGroups.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Camera Groups</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {cameraGroups.map(group => (
                  <SidebarMenuItem key={group}>
                    <SidebarMenuButton asChild>
                      <Link to={`/cameras?group=${encodeURIComponent(group.toLowerCase())}`}>
                        <Layers />
                        <span>{group}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="rounded-md bg-vision-dark-900 p-4">
          <p className="text-xs text-muted-foreground">Vision Hub v1.0.0</p>
        </div>
      </SidebarFooter>
      
      <SidebarTrigger />
    </SidebarComponent>
  );
};

export default Sidebar;
