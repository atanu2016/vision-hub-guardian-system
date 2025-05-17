
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Settings, ChevronRight, PlaySquare, Bell, HardDrive, Sliders } from "lucide-react";

interface MenuItem {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

interface SettingsMenuSectionProps {
  title: string;
  description: string;
  items: MenuItem[];
  isActive: (path: string) => boolean;
}

export const SettingsMenuSection = ({ title, description, items, isActive }: SettingsMenuSectionProps) => {
  const navigate = useNavigate();
  
  const handleItemClick = (href: string, disabled?: boolean) => {
    if (!disabled) {
      navigate(href);
    }
  };
  
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
            className={`flex items-start gap-4 rounded-lg border p-3 text-left text-sm transition-all cursor-pointer
              ${isActive(item.href) ? 'bg-accent' : 'hover:bg-accent'} 
              ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handleItemClick(item.href, item.disabled)}
          >
            <div className="flex items-center">
              {item.icon}
            </div>
            <div className="flex-1 space-y-1">
              <div className="font-medium">{item.title}</div>
              <div className="text-xs text-muted-foreground">
                {item.description}
              </div>
            </div>
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
    location.pathname.startsWith("/settings/storage") ||
    location.pathname.startsWith("/settings/system")
  );

  // Update expanded state when route changes
  useEffect(() => {
    setIsSettingsExpanded(
      location.pathname.startsWith("/settings") || 
      location.pathname.startsWith("/settings/recordings") || 
      location.pathname.startsWith("/settings/alerts") || 
      location.pathname.startsWith("/settings/storage") ||
      location.pathname.startsWith("/settings/system")
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
              isActive={isActive("/settings/system")}
              className="pl-8"
            >
              <Link to="/settings/system">
                <Sliders />
                <span>System Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

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

// Only export the default once
export default SidebarSettingsMenu;
