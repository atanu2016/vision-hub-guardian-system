
import { SidebarFooter as FooterComponent } from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useSidebar } from "@/components/ui/sidebar";
import { toast } from "sonner";
import { useState } from "react";

const SidebarFooter = () => {
  const { signOut } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      console.log("Sidebar footer: initiating sign out");
      await signOut();
      // Note: We don't reset isLoggingOut here because the page will be redirected
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out. Please try again.");
      setIsLoggingOut(false);
    }
  };

  return (
    <FooterComponent className="p-4">
      <div className="rounded-md bg-vision-dark-900 p-2">
        <button 
          onClick={handleSignOut}
          disabled={isLoggingOut}
          className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-vision-dark-800 rounded transition duration-200 disabled:opacity-50"
          title="Sign Out"
        >
          <LogOut size={18} />
          {!isCollapsed && <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>}
        </button>
      </div>
    </FooterComponent>
  );
};

export default SidebarFooter;
