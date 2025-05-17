
import { SidebarHeader as HeaderComponent } from "@/components/ui/sidebar";
import { Monitor } from "lucide-react";

const SidebarHeader = () => {
  return (
    <HeaderComponent className="px-4 py-6">
      <div className="flex items-center space-x-2">
        <div className="bg-vision-blue-500 p-1 rounded">
          <Monitor size={24} className="text-white" />
        </div>
        <h2 className="text-xl font-bold">VideoGuard</h2>
      </div>
    </HeaderComponent>
  );
};

export default SidebarHeader;
