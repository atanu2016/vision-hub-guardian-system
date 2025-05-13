
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
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const Sidebar = () => {
  const location = useLocation();
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(
    location.pathname.startsWith("/settings") || 
    location.pathname.startsWith("/recordings") || 
    location.pathname.startsWith("/alerts") || 
    location.pathname.startsWith("/storage")
  );

  const isActive = (path: string) => {
    return location.pathname === path;
  };

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
                    isActive("/settings") || 
                    isActive("/recordings") || 
                    isActive("/alerts") || 
                    isActive("/storage")
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
                      isActive={isActive("/recordings")}
                      className="pl-8"
                    >
                      <Link to="/recordings">
                        <PlaySquare />
                        <span>Recordings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive("/alerts")}
                      className="pl-8"
                    >
                      <Link to="/alerts">
                        <Bell />
                        <span>Alerts</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive("/storage")}
                      className="pl-8"
                    >
                      <Link to="/storage">
                        <Archive />
                        <span>Storage</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Camera Groups</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/groups/indoor">
                    <Layers />
                    <span>Indoor</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/groups/outdoor">
                    <Layers />
                    <span>Outdoor</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
