
import { Link } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Home, Camera, Settings, Shield, Video } from "lucide-react";
import { useAuth } from "@/contexts/auth";

interface MainNavigationProps {
  isActive: (path: string) => boolean;
}

const MainNavigation = ({ isActive }: MainNavigationProps) => {
  const { isAdmin } = useAuth();
  
  const navigationItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/cameras", icon: Camera, label: "Cameras" },
    { path: "/live-view", icon: Video, label: "Live View" },
    { path: "/recordings", icon: Video, label: "Recordings" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];
  
  // Only show admin route if user is an admin
  if (isAdmin) {
    navigationItems.push({ 
      path: "/admin", 
      icon: Shield, 
      label: "Admin" 
    });
  }
  
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {navigationItems.map(({ path, icon: Icon, label }) => (
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
