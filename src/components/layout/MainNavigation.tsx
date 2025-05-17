
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
import { useEffect } from "react";

interface MainNavigationProps {
  isActive: (path: string) => boolean;
}

const MainNavigation = ({ isActive }: MainNavigationProps) => {
  const { role: authRole } = useAuth();
  const { hasPermission, currentRole } = usePermissions();
  
  // Using both authRole and currentRole from usePermissions for redundancy
  const role = currentRole || authRole;
  
  useEffect(() => {
    console.log("[NAV] MainNavigation rendering - Auth role:", authRole);
    console.log("[NAV] MainNavigation rendering - Current role:", currentRole);
  }, [authRole, currentRole]);
  
  // Create a direct check for showing recordings menu
  const shouldShowRecordings = () => {
    console.log("[NAV] Directly checking if recordings should be shown for role:", role);
    // Always show for operators, admins, and superadmins
    return role === 'operator' || role === 'admin' || role === 'superadmin';
  };
  
  useEffect(() => {
    // For operators, always log detailed permission checks
    if (role === 'operator') {
      console.log("[NAV] OPERATOR ROLE DETECTED - permission checks:");
      console.log("[NAV] - view-footage:assigned:", hasPermission('view-footage:assigned'));
      console.log("[NAV] - view-cameras:assigned:", hasPermission('view-cameras:assigned'));
      console.log("[NAV] - manage-profile-settings:", hasPermission('manage-profile-settings'));
    }
  }, [role, hasPermission]);
  
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
  if (shouldShowRecordings()) {
    navigationItems.push({ 
      path: "/recordings", 
      icon: FileText, 
      label: "Recordings", 
      permission: 'view-footage:assigned' as Permission,
      showForRoles: ['operator', 'admin', 'superadmin']
    });
  }
  
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
  
  // Extended logging for recordings menu item
  console.log(`[NAV] shouldShowRecordings() = ${shouldShowRecordings()}`);
  console.log(`[NAV] User role = ${role}`);
  console.log(`[NAV] hasPermission('view-footage:assigned') = ${hasPermission('view-footage:assigned')}`);
  
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {/* Special case for operator role: directly render required items */}
          {role === 'operator' && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/live")} className="hover:bg-vision-dark-800">
                  <Link to="/live">
                    <Video />
                    <span>Live View</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/recordings")} className="hover:bg-vision-dark-800">
                  <Link to="/recordings">
                    <FileText />
                    <span>Recordings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/profile-settings")} className="hover:bg-vision-dark-800">
                  <Link to="/profile-settings">
                    <User />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}

          {/* Other roles use the dynamic navigation items */}
          {role !== 'operator' && navigationItems
            .filter(item => {
              const hasRequiredRole = item.showForRoles.includes(role);
              const hasRequiredPermission = hasPermission(item.permission);
              
              console.log(`[NAV] Item ${item.label}: hasRole=${hasRequiredRole}, hasPermission=${hasRequiredPermission}`);
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
