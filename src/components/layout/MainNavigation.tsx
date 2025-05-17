
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
    console.log("[NAV] MainNavigation rendering - Final role used:", role);
    
    // Log when operator role is detected
    if (role === 'operator') {
      console.log("[NAV] OPERATOR ROLE DETECTED in MainNavigation - Recordings should be visible");
    }
  }, [authRole, currentRole, role]);

  // Always check permissions with multiple approaches for safety
  const hasFeetageAssignedPermission = hasPermission('view-footage:assigned');
  const hasFeetageAllPermission = hasPermission('view-footage:all');
  const isRoleOperatorOrHigher = role === 'operator' || role === 'admin' || role === 'superadmin';
  
  // Force recordings access for operators - critical for application functionality
  const shouldShowRecordings = () => {
    // This is a critical check that ensures operators always have access to recordings
    if (role === 'operator') {
      console.log("[NAV] OPERATOR ROLE - Force enabling recordings access");
      return true;
    }
    
    // For other roles, use standard permission checks
    const hasAccess = hasFeetageAssignedPermission || hasFeetageAllPermission || isRoleOperatorOrHigher;
    console.log("[NAV] Recordings access check:", { 
      hasFeetageAssignedPermission, 
      hasFeetageAllPermission, 
      isRoleOperatorOrHigher,
      finalDecision: hasAccess
    });
    return hasAccess;
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {/* Navigation for Live View - available to all user roles */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/live")} className="hover:bg-vision-dark-800">
              <Link to="/live">
                <Video />
                <span>Live View</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* CRITICAL: Recordings - Always show for operators */}
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
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default MainNavigation;
