
import { SidebarFooter as FooterComponent } from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth";

const SidebarFooter = () => {
  const { signOut } = useAuth();

  return (
    <FooterComponent className="p-4">
      <div className="rounded-md bg-vision-dark-900 p-2">
        <button 
          onClick={() => signOut()}
          className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-vision-dark-800 rounded transition duration-200"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </FooterComponent>
  );
};

export default SidebarFooter;
