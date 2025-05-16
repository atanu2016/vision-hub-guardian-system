
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import {
  Camera as CameraIcon,
  LogOut,
  Monitor,
  Video,
  Settings as SettingsIcon
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import MainNavigation from "./MainNavigation";
import CameraGroupsList from "./CameraGroupsList";

const Sidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <SidebarComponent>
      <SidebarHeader className="px-4 py-6">
        <div className="flex items-center space-x-2">
          <div className="bg-vision-blue-500 p-1 rounded">
            <Monitor size={24} className="text-white" />
          </div>
          <h2 className="text-xl font-bold">VideoGuard</h2>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <MainNavigation isActive={isActive} />
        <CameraGroupsList />
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="rounded-md bg-vision-dark-900 p-2">
          <button 
            onClick={() => signOut()}
            className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-vision-dark-800 rounded transition duration-200"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </SidebarFooter>
      
      <SidebarTrigger />
    </SidebarComponent>
  );
};

export default Sidebar;
