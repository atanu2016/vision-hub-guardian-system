
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
  
  // Recordings - for operator, admin, and superadmin - CRITICAL ITEM!
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
  
  // Special handling for "Recordings" item
  const recordingsItem = navigationItems.find(item => item.label === "Recordings");
  if (recordingsItem && role === 'operator') {
    console.log("IMPORTANT: Recordings menu check for operator role");
    console.log("Permission check result:", hasPermission('view-footage:assigned'));
  }
  
  // Log navigation items that will be shown to the user
  const visibleItems = navigationItems.filter(item => {
    const hasRequiredRole = item.showForRoles.includes(role);
    
    // Add special debug case for Recordings item
    if (item.label === "Recordings") {
      console.log(`Special check for Recordings menu item:`);
      console.log(`- Role: ${role}`);
      console.log(`- Has required role (${item.showForRoles.join(", ")}): ${hasRequiredRole}`);
      console.log(`- Permission check for ${item.permission}: ${hasPermission(item.permission)}`);
    }
    
    const hasRequiredPermission = hasPermission(item.permission);
    console.log(`Menu item ${item.label}: has role ${hasRequiredRole}, has permission ${hasRequiredPermission}`);
    return hasRequiredRole && hasRequiredPermission;
  });
  console.log("Visible navigation items:", visibleItems);
  
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {navigationItems
            .filter(item => {
              // Only show items for the current user's role
              const hasRequiredRole = item.showForRoles.includes(role);
              
              // Extra logging for debugging the Recordings item
              if (item.label === "Recordings") {
                console.log(`Filtering Recordings item - role ${role} included: ${hasRequiredRole}`);
              }
              
              // Check if user has permission
              const hasRequiredPermission = hasPermission(item.permission);
              
              if (item.label === "Recordings") {
                console.log(`Filtering Recordings item - permission ${item.permission}: ${hasRequiredPermission}`);
                // Force enable for operator role - debugging measure
                if (role === 'operator') {
                  console.log("Forcing Recordings menu to be visible for operator");
                  return true;
                }
              }
              
              return hasRequiredRole && hasRequiredPermission;
            })
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
