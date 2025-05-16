
import { Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
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
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/cameras" element={<ProtectedRoute><Cameras /></ProtectedRoute>} />
          <Route path="/cameras/:id" element={<ProtectedRoute><CameraDetail /></ProtectedRoute>} />
          
          {/* Settings Routes */}
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/settings/storage" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/settings/recordings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/settings/alerts" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/settings/webhooks" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/settings/advanced" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/settings/database" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/settings/logs" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requireAdmin={true}><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/users/create" element={<ProtectedRoute requireAdmin={true}><CreateUser /></ProtectedRoute>} />
          <Route path="/profile-settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
