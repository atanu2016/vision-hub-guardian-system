
import { Link, useLocation } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Home, Camera, Settings, Shield, Video } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { usePermissions } from "@/hooks/usePermissions";

interface MainNavigationProps {
  isActive: (path: string) => boolean;
}

const MainNavigation = ({ isActive }: MainNavigationProps) => {
  const { role } = useAuth();
  const { hasPermission } = usePermissions();
  const location = useLocation();
  
  const navigationItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/cameras", icon: Camera, label: "Cameras", permission: 'view-cameras:assigned' as const },
    { path: "/live", icon: Video, label: "Live View", permission: 'view-cameras:assigned' as const },
    { path: "/recordings", icon: Video, label: "Recordings", permission: 'view-footage:assigned' as const },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];
  
  // Only show admin route if user has admin privileges
  if (role === 'admin' || role === 'superadmin') {
    navigationItems.push({ 
      path: "/admin", 
      icon: Shield, 
      label: "Admin",
      permission: 'manage-users:lower' as const
    });
  }
  
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {navigationItems.map(({ path, icon: Icon, label, permission }) => {
            // If this menu item requires a specific permission, check it
            if (permission && !hasPermission(permission)) {
              return null;
            }
            
            return (
              <SidebarMenuItem key={path}>
                <SidebarMenuButton asChild isActive={isActive(path)} className="hover:bg-vision-dark-800">
                  <Link to={path}>
                    <Icon />
                    <span>{label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default MainNavigation;
