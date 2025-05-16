
import { SidebarTrigger } from "@/components/ui/sidebar";

const MobileSidebarToggle = () => {
  return (
    <div className="md:hidden">
      <SidebarTrigger />
    </div>
  );
};

export default MobileSidebarToggle;
