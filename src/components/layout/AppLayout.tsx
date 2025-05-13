
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

const AppLayout = ({ children, className, fullWidth = false }: AppLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <TopBar />
          <ScrollArea className="flex-1">
            <main className={cn(
              "flex-1 p-4 md:p-6",
              !fullWidth && "max-w-7xl mx-auto",
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
