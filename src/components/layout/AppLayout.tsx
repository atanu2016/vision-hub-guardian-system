
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

const AppLayout = ({ children, className, fullWidth = false }: AppLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-hidden bg-background dark:bg-vision-dark-950">
        <Sidebar />
        <div className="flex flex-col flex-1 w-full">
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
    </SidebarProvider>
  );
};

export default AppLayout;
