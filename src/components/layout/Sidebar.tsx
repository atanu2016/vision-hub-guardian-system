
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

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <SidebarComponent>
      <SidebarHeader />
      
      <SidebarContent>
        <MainNavigation isActive={isActive} />
        <CameraGroupsList />
      </SidebarContent>

      <SidebarFooter />
      
      <SidebarTrigger />
    </SidebarComponent>
  );
};

export default Sidebar;
