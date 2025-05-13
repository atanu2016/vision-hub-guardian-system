
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <TopBar />
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
