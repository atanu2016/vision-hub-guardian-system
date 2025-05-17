
import { Link } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Home, Camera, Settings, Shield, Video, FileText, User } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { usePermissions } from "@/hooks/usePermissions";
import { Permission } from "@/utils/permissionUtils";

interface MainNavigationProps {
  isActive: (path: string) => boolean;
}

const MainNavigation = ({ isActive }: MainNavigationProps) => {
  const { role } = useAuth();
  const { hasPermission } = usePermissions();
  
  console.log("MainNavigation rendering - User role:", role);
  
  // Define navigation items with their required permissions
  const navigationItems = [];
  
  // Live View - available to all user roles (this should be first for users and operators)
  navigationItems.push({ 
    path: "/live", 
    icon: Video, 
    label: "Live View", 
    permission: 'view-cameras:assigned' as Permission,
    showForRoles: ['user', 'operator', 'admin', 'superadmin']
  });
  
  // Recordings - for operator, admin, and superadmin
  navigationItems.push({ 
    path: "/recordings", 
    icon: FileText, 
    label: "Recordings", 
    permission: 'view-footage:assigned' as Permission,
    showForRoles: ['operator', 'admin', 'superadmin']
  });
  
  // Dashboard - only for admin and superadmin
  if (role === 'admin' || role === 'superadmin') {
    navigationItems.push({ 
      path: "/", 
      icon: Home, 
      label: "Dashboard", 
      permission: 'view-dashboard' as Permission,
      showForRoles: ['admin', 'superadmin']
    });
  }
  
  // Cameras - only for admin and superadmin
  if (role === 'admin' || role === 'superadmin') {
    navigationItems.push({ 
      path: "/cameras", 
      icon: Camera, 
      label: "Cameras", 
      permission: 'view-cameras:all' as Permission,
      showForRoles: ['admin', 'superadmin']
    });
  }
  
  // Settings - only for admin and superadmin
  if (role === 'admin' || role === 'superadmin') {
    navigationItems.push({ 
      path: "/settings", 
      icon: Settings, 
      label: "Settings", 
      permission: 'configure-camera-settings' as Permission,
      showForRoles: ['admin', 'superadmin']
    });
  }
  
  // Admin - only for admin and superadmin
  if (role === 'admin' || role === 'superadmin') {
    navigationItems.push({ 
      path: "/admin", 
      icon: Shield, 
      label: "Admin",
      permission: 'manage-users:lower' as Permission,
      showForRoles: ['admin', 'superadmin']
    });
  }

  // Profile Settings - available to all users
  navigationItems.push({
    path: "/profile-settings",
    icon: User,
    label: "Profile",
    permission: 'manage-profile-settings' as Permission,
    showForRoles: ['user', 'operator', 'admin', 'superadmin']
  });
  
  // Log navigation items that will be shown to the user
  const visibleItems = navigationItems.filter(item => 
    item.showForRoles.includes(role) && hasPermission(item.permission)
  );
  console.log("Visible navigation items:", visibleItems);
  
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {navigationItems
            .filter(item => 
              // Only show items for the current user's role
              item.showForRoles.includes(role) && 
              // Check if user has permission
              hasPermission(item.permission)
            )
            .map(({ path, icon: Icon, label }) => (
              <SidebarMenuItem key={path}>
                <SidebarMenuButton asChild isActive={isActive(path)} className="hover:bg-vision-dark-800">
                  <Link to={path}>
                    <Icon />
                    <span>{label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default MainNavigation;
