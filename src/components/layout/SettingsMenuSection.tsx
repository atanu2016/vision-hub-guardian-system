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

interface MenuItem {
  title: string;
  description: string;
  href: string;
  disabled?: boolean;
}

interface SettingsMenuSectionProps {
  title: string;
  description: string;
  items: MenuItem[];
}

export const SettingsMenuSection = ({ title, description, items }: SettingsMenuSectionProps) => {
  return (
    <div className="space-y-3">
      <div className="px-2">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-1">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-4 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent"
          >
            <div className="flex-1 space-y-1">
              <div className="flex items-center">
                <div className="font-medium">{item.title}</div>
              </div>
              <div className="text-xs text-muted-foreground">
                {item.description}
              </div>
            </div>
            {item.href && !item.disabled && (
              <div className="ml-auto flex items-center gap-2">
                <Link
                  to={item.href}
                  className="underline-offset-4 hover:underline"
                >
                  View
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Keep the default export for backwards compatibility
const SidebarSettingsMenu = ({ isActive }: { isActive: (path: string) => boolean }) => {
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

export default SidebarSettingsMenu;
