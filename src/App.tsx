
import { Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthProvider } from "@/contexts/auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "@/pages/Index";
import Cameras from "@/pages/Cameras";
import CameraDetail from "@/pages/CameraDetail";
import Settings from "@/pages/Settings";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import ProfileSettings from "@/pages/ProfileSettings";
import Notifications from "@/pages/Notifications";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { initializeSystem } from "@/data/mockData";
import { toast } from "sonner";
import AdminPage from "@/pages/admin/index";
import UserManagement from "@/pages/admin/UserManagement";
import CreateUser from "@/pages/admin/CreateUser";

function App() {
  // Initialize the system when the app starts
  useEffect(() => {
    const init = async () => {
      try {
        await initializeSystem();
        console.log("System initialized with database integration");
      } catch (error) {
        console.error("Failed to initialize system:", error);
        toast("System Initialization Error", {
          description: "Failed to connect to the database"
        });
      }
    };
    
    init();
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vision-hub-theme">
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          
          {/* Wrap protected routes with SidebarProvider */}
          <Route path="/" element={
            <SidebarProvider>
              <ProtectedRoute><Index /></ProtectedRoute>
            </SidebarProvider>
          } />
          <Route path="/cameras" element={
            <SidebarProvider>
              <ProtectedRoute><Cameras /></ProtectedRoute>
            </SidebarProvider>
          } />
          <Route path="/cameras/:id" element={
            <SidebarProvider>
              <ProtectedRoute><CameraDetail /></ProtectedRoute>
            </SidebarProvider>
          } />
          
          {/* Settings Routes */}
          <Route path="/settings" element={
            <SidebarProvider>
              <ProtectedRoute><Settings /></ProtectedRoute>
            </SidebarProvider>
          } />
          <Route path="/settings/storage" element={
            <SidebarProvider>
              <ProtectedRoute><Settings /></ProtectedRoute>
            </SidebarProvider>
          } />
          <Route path="/settings/recordings" element={
            <SidebarProvider>
              <ProtectedRoute><Settings /></ProtectedRoute>
            </SidebarProvider>
          } />
          <Route path="/settings/alerts" element={
            <SidebarProvider>
              <ProtectedRoute><Settings /></ProtectedRoute>
            </SidebarProvider>
          } />
          <Route path="/settings/webhooks" element={
            <SidebarProvider>
              <ProtectedRoute><Settings /></ProtectedRoute>
            </SidebarProvider>
          } />
          <Route path="/settings/advanced" element={
            <SidebarProvider>
              <ProtectedRoute><Settings /></ProtectedRoute>
            </SidebarProvider>
          } />
          <Route path="/settings/database" element={
            <SidebarProvider>
              <ProtectedRoute><Settings /></ProtectedRoute>
            </SidebarProvider>
          } />
          <Route path="/settings/logs" element={
            <SidebarProvider>
              <ProtectedRoute><Settings /></ProtectedRoute>
            </SidebarProvider>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <SidebarProvider>
              <ProtectedRoute requireAdmin={true}><AdminPage /></ProtectedRoute>
            </SidebarProvider>
          } />
          <Route path="/admin/users" element={
            <SidebarProvider>
              <ProtectedRoute requireAdmin={true}><UserManagement /></ProtectedRoute>
            </SidebarProvider>
          } />
          <Route path="/admin/users/create" element={
            <SidebarProvider>
              <ProtectedRoute requireAdmin={true}><CreateUser /></ProtectedRoute>
            </SidebarProvider>
          } />
          <Route path="/profile-settings" element={
            <SidebarProvider>
              <ProtectedRoute><ProfileSettings /></ProtectedRoute>
            </SidebarProvider>
          } />
          <Route path="/notifications" element={
            <SidebarProvider>
              <ProtectedRoute><Notifications /></ProtectedRoute>
            </SidebarProvider>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
