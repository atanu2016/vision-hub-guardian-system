
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/components/ui/sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

const AppLayout = ({ children, className, fullWidth = false }: AppLayoutProps) => {
  const isMobile = useIsMobile();
  const { state } = useSidebar();
  const sidebarCollapsed = state === "collapsed";

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-background dark:bg-vision-dark-950">
      {/* Fixed position sidebar */}
      <Sidebar />
      
      {/* Main content area with margin that respects sidebar width */}
      <div className={cn(
        "flex flex-col flex-1 w-full transition-all duration-300", 
        !isMobile && (sidebarCollapsed ? "ml-[3rem]" : "ml-[16rem]")
      )}>
        <TopBar />
        <ScrollArea className="flex-1 w-full h-[calc(100vh-64px)]">
          <main className={cn(
            "flex-1 p-4 md:p-6 w-full",
            !fullWidth && "max-w-full mx-auto",
            className
          )}>
            <div className="animate-fade-in">
              {children}
            </div>
          </main>
        </ScrollArea>
      </div>
    </div>
  );
};

export default AppLayout;
