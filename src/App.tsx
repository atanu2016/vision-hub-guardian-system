
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme/theme-provider"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth"; // Add this import for useAuth

import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Cameras from "@/pages/Cameras";
import CameraDetail from "@/pages/CameraDetail";
import LiveView from "@/pages/LiveView";
import Recordings from "@/pages/Recordings";
import Notifications from "@/pages/Notifications";
import ProfileSettings from "@/pages/ProfileSettings";
import Settings from "@/pages/Settings";
import Admin from "@/pages/admin";
import UserManagement from "@/pages/admin/UserManagement";
import CreateUser from "@/pages/admin/CreateUser";
import NotFound from "@/pages/NotFound";

import { AuthProvider } from "@/contexts/auth";
import { ProtectedRoute } from "@/components/auth";

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Toaster position="top-right" richColors />
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <SidebarProvider>
            <Routes>
              {/* Auth route */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Redirect root to dashboard for admin users, live view for others */}
              <Route path="/" element={
                <ProtectedRoute>
                  <AdminRedirect />
                </ProtectedRoute>
              } />
              
              {/* Dashboard - only accessible to admin/superadmin */}
              <Route path="/dashboard" element={<ProtectedRoute requiredPermission="view-dashboard"><Index /></ProtectedRoute>} />
              
              {/* Basic views */}
              <Route path="/cameras" element={<ProtectedRoute requiredPermission="view-cameras:all"><Cameras /></ProtectedRoute>} />
              <Route path="/cameras/:id" element={<ProtectedRoute requiredPermission="view-cameras:assigned"><CameraDetail /></ProtectedRoute>} />
              <Route path="/live" element={<ProtectedRoute requiredPermission="view-cameras:assigned"><LiveView /></ProtectedRoute>} />
              
              {/* CRITICAL: Recordings - minimum permission requirement for observers */}
              <Route path="/recordings" element={
                <ProtectedRoute requiredPermission="view-footage:assigned">
                  <Recordings />
                </ProtectedRoute>
              } />
              
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute requiredPermission="view-profile"><ProfileSettings /></ProtectedRoute>} />
              <Route path="/profile-settings" element={<ProtectedRoute requiredPermission="manage-profile-settings"><ProfileSettings /></ProtectedRoute>} />
              
              {/* Settings routes - most require admin permissions */}
              <Route path="/settings" element={<ProtectedRoute requiredPermission="configure-camera-settings"><Settings /></ProtectedRoute>} />
              <Route path="/settings/storage" element={<ProtectedRoute requiredPermission="configure-storage"><Settings /></ProtectedRoute>} />
              <Route path="/settings/recordings" element={<ProtectedRoute requiredPermission="configure-camera-settings"><Settings /></ProtectedRoute>} />
              <Route path="/settings/alerts" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/settings/webhooks" element={<ProtectedRoute requiredPermission="configure-global-policies"><Settings /></ProtectedRoute>} />
              <Route path="/settings/advanced" element={<ProtectedRoute requiredPermission="manage-system"><Settings /></ProtectedRoute>} />
              <Route path="/settings/database" element={<ProtectedRoute requiredPermission="manage-system"><Settings /></ProtectedRoute>} />
              <Route path="/settings/logs" element={<ProtectedRoute requiredPermission="access-logs"><Settings /></ProtectedRoute>} />
              <Route path="/settings/system" element={<ProtectedRoute requiredPermission="manage-system"><Settings /></ProtectedRoute>} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<ProtectedRoute adminRequired={true}><Admin /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute requiredPermission="manage-users:lower"><UserManagement /></ProtectedRoute>} />
              <Route path="/admin/users/create" element={<ProtectedRoute superadminRequired={true}><CreateUser /></ProtectedRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SidebarProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// New component to redirect based on role
const AdminRedirect = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <Navigate to="/dashboard" replace /> : <Navigate to="/live" replace />;
};

export default App;
