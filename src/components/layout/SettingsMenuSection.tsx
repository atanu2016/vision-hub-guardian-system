
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Settings,
  PlaySquare,
  Bell,
  HardDrive,
  ChevronRight,
} from "lucide-react";

interface SettingsMenuSectionProps {
  isActive: (path: string) => boolean;
}

const SettingsMenuSection = ({ isActive }: SettingsMenuSectionProps) => {
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

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton 
          onClick={() => setIsSettingsExpanded(!isSettingsExpanded)} 
          isActive={location.pathname.startsWith("/settings")}
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
    </>
  );
};

export default SettingsMenuSection;
