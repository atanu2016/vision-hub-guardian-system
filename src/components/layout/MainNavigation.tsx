
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

interface MainNavigationProps {
  isActive: (path: string) => boolean;
}

const MainNavigation = ({ isActive }: MainNavigationProps) => {
  const { role: authRole } = useAuth();
  const { hasPermission, currentRole } = usePermissions();
  
  // Using both authRole and currentRole from usePermissions for redundancy
  const role = currentRole || authRole;

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

          {/* Recordings - Only for admins */}
          {hasPermission('view-footage:assigned') && (
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
