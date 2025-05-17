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
    
    // Log when operator role is detected
    if (role === 'operator') {
      console.log("[NAV] OPERATOR ROLE DETECTED in MainNavigation");
    }
  }, [authRole, currentRole, role]);
  
  // Simplified function to determine if recordings should be shown
  // This function prioritizes showing recordings for operators
  const shouldShowRecordings = () => {
    // Explicit log for debugging
    console.log("[NAV] Checking if recordings should be shown for role:", role);

    // Always show recordings for operators - this is the critical fix
    return role === 'operator' || role === 'admin' || role === 'superadmin';
  };

  useEffect(() => {
    if (role === 'operator') {
      // Enhanced logging for operators to help with debugging
      console.log("[NAV] OPERATOR PERMISSIONS CHECK:");
      console.log("[NAV] - has view-footage:assigned:", hasPermission('view-footage:assigned'));
      console.log("[NAV] - has view-cameras:assigned:", hasPermission('view-cameras:assigned'));
      console.log("[NAV] - shouldShowRecordings():", shouldShowRecordings());
    }
  }, [role, hasPermission]);

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {/* Special hardcoded section for operator role to guarantee correct menu items */}
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
              
              {/* This is the critical item for operators */}
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
          {role !== 'operator' && (
            <>
              {/* Navigation for Live View - available to all user roles */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/live")} className="hover:bg-vision-dark-800">
                  <Link to="/live">
                    <Video />
                    <span>Live View</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Recordings - show for admin and superadmin through dynamic check */}
              {shouldShowRecordings() && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/recordings")} className="hover:bg-vision-dark-800">
                    <Link to="/recordings">
                      <FileText />
                      <span>Recordings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Dashboard - only for admin and superadmin */}
              {(role === 'admin' || role === 'superadmin') && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/")} className="hover:bg-vision-dark-800">
                    <Link to="/">
                      <Home />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Cameras - only for admin and superadmin */}
              {(role === 'admin' || role === 'superadmin') && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/cameras")} className="hover:bg-vision-dark-800">
                    <Link to="/cameras">
                      <Camera />
                      <span>Cameras</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Settings - only for admin and superadmin */}
              {(role === 'admin' || role === 'superadmin') && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/settings")} className="hover:bg-vision-dark-800">
                    <Link to="/settings">
                      <Settings />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Admin - only for admin and superadmin */}
              {(role === 'admin' || role === 'superadmin') && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/admin")} className="hover:bg-vision-dark-800">
                    <Link to="/admin">
                      <Shield />
                      <span>Admin</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Profile Settings - available to all users */}
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
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default MainNavigation;
