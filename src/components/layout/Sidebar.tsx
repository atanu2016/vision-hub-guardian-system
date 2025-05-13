
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { Camera as CameraIcon } from "lucide-react";
import { useLocation } from "react-router-dom";
import MainNavigation from "./MainNavigation";
import CameraGroupsList from "./CameraGroupsList";

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <SidebarComponent>
      <SidebarHeader className="px-4 py-6">
        <div className="flex items-center space-x-2">
          <div className="bg-vision-blue-500 p-1 rounded">
            <CameraIcon size={24} className="text-white" />
          </div>
          <h2 className="text-xl font-bold">Vision Hub</h2>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <MainNavigation isActive={isActive} />
        <CameraGroupsList />
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="rounded-md bg-vision-dark-900 p-4">
          <p className="text-xs text-muted-foreground">Vision Hub v1.0.0</p>
        </div>
      </SidebarFooter>
      
      <SidebarTrigger />
    </SidebarComponent>
  );
};

export default Sidebar;
