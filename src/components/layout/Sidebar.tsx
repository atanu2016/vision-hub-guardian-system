
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { useLocation } from "react-router-dom";
import MainNavigation from "./MainNavigation";
import CameraGroupsList from "./CameraGroupsList";
import SidebarHeader from "./sidebar/SidebarHeader";
import SidebarFooter from "./sidebar/SidebarFooter";
import { useSidebar } from "@/components/ui/sidebar";

const Sidebar = () => {
  const location = useLocation();
  const { state } = useSidebar();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <SidebarComponent className="border-r border-border dark:border-vision-dark-800">
      <SidebarHeader />
      
      <SidebarContent className="flex flex-col flex-grow">
        <MainNavigation isActive={isActive} />
        <CameraGroupsList />
      </SidebarContent>

      <SidebarFooter />
      
      <SidebarTrigger />
    </SidebarComponent>
  );
};

export default Sidebar;
