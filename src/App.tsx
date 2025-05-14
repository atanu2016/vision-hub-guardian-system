
import { Route, Routes, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "@/pages/Index";
import Cameras from "@/pages/Cameras";
import CameraDetail from "@/pages/CameraDetail";
import Settings from "@/pages/Settings";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import Admin from "@/pages/Admin";
import ProfileSettings from "@/pages/ProfileSettings";
import StorageSettings from "@/pages/settings/StorageSettings";
import RecordingsPage from "@/pages/settings/RecordingsPage";
import AlertsPage from "@/pages/settings/AlertsPage";
import Notifications from "@/pages/Notifications";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { initializeSystem } from "@/services/apiService";
import { toast } from "@/hooks/use-toast";

function App() {
  // Initialize the system when the app starts
  useEffect(() => {
    const init = async () => {
      try {
        await initializeSystem();
        // Let the user know camera data has been initialized
        toast({
          title: "Vision Hub v1.0.0",
          description: "Public camera examples initialized",
        });
      } catch (error) {
        console.error("Failed to initialize system:", error);
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
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/settings/storage" element={<ProtectedRoute><StorageSettings /></ProtectedRoute>} />
          <Route path="/settings/recordings" element={<ProtectedRoute><RecordingsPage /></ProtectedRoute>} />
          <Route path="/settings/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requireAdmin>{<Admin />}</ProtectedRoute>} />
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
