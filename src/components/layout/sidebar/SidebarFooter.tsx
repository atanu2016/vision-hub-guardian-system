
import { SidebarFooter as FooterComponent } from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useSidebar } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const SidebarFooter = () => {
  const { signOut } = useAuth();
  const { state } = useSidebar();
  const navigate = useNavigate();
  const isCollapsed = state === "collapsed";

  const handleSignOut = async () => {
    try {
      console.log("Sidebar footer: initiating sign out");
      toast.loading("Signing out...");
      // Pass navigate to signOut without explicit parameter
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  return (
    <FooterComponent className="p-4">
      <div className="rounded-md bg-vision-dark-900 p-2">
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-vision-dark-800 rounded transition duration-200"
          title="Sign Out"
        >
          <LogOut size={18} />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </FooterComponent>
  );
};

export default SidebarFooter;
