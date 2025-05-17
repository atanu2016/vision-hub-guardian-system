
import { SidebarHeader as HeaderComponent } from "@/components/ui/sidebar";
import { Monitor } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

const SidebarHeader = () => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <HeaderComponent className="px-4 py-6">
      <div className="flex items-center space-x-2">
        <div className="bg-vision-blue-500 p-1 rounded flex-shrink-0">
          <Monitor size={24} className="text-white" />
        </div>
        {!isCollapsed && (
          <h2 className="text-xl font-bold truncate">VideoGuard</h2>
        )}
      </div>
    </HeaderComponent>
  );
};

export default SidebarHeader;
