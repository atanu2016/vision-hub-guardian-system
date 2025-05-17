
import { Link, useLocation } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Home, Camera, Settings, Shield, Video, FileText } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { usePermissions } from "@/hooks/usePermissions";
import { Permission } from "@/utils/permissionUtils";

interface MainNavigationProps {
  isActive: (path: string) => boolean;
}

const MainNavigation = ({ isActive }: MainNavigationProps) => {
  const { role } = useAuth();
  const { hasPermission } = usePermissions();
  const location = useLocation();
  
  // Define navigation items with their required permissions
  const navigationItems = [];
  
  // Dashboard - only for admin and superadmin
  if (role === 'admin' || role === 'superadmin') {
    navigationItems.push({ 
      path: "/", 
      icon: Home, 
      label: "Dashboard", 
      permission: 'view-dashboard' as Permission 
    });
  }
  
  // Live View - available to all user roles
  navigationItems.push({ 
    path: "/live", 
    icon: Video, 
    label: "Live View", 
    permission: 'view-cameras:assigned' as Permission 
  });
  
  // Recordings - only for operator, admin, and superadmin
  if (role === 'operator' || role === 'admin' || role === 'superadmin') {
    navigationItems.push({ 
      path: "/recordings", 
      icon: FileText, 
      label: "Recordings", 
      permission: 'view-footage:assigned' as Permission 
    });
  }
  
  // Cameras - only for admin and superadmin
  if (role === 'admin' || role === 'superadmin') {
    navigationItems.push({ 
      path: "/cameras", 
      icon: Camera, 
      label: "Cameras", 
      permission: 'view-cameras:all' as Permission 
    });
  }
  
  // Settings - only for admin and superadmin
  if (role === 'admin' || role === 'superadmin') {
    navigationItems.push({ 
      path: "/settings", 
      icon: Settings, 
      label: "Settings", 
      permission: 'configure-camera-settings' as Permission 
    });
  }
  
  // Admin - only for admin and superadmin
  if (role === 'admin' || role === 'superadmin') {
    navigationItems.push({ 
      path: "/admin", 
      icon: Shield, 
      label: "Admin",
      permission: 'manage-users:lower' as Permission
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
