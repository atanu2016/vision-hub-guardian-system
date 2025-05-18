
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000
    }
  }
});

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
                  <RoleBasedRedirect />
                </ProtectedRoute>
              } />
              
              {/* Dashboard - accessible to anyone while testing */}
              <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              
              {/* Basic views */}
              <Route path="/cameras" element={<ProtectedRoute><Cameras /></ProtectedRoute>} />
              <Route path="/cameras/:id" element={<ProtectedRoute><CameraDetail /></ProtectedRoute>} />
              <Route path="/live" element={<ProtectedRoute><LiveView /></ProtectedRoute>} />
              
              {/* CRITICAL: Recordings - minimum permission requirement for observers */}
              <Route path="/recordings" element={
                <ProtectedRoute>
                  <Recordings />
                </ProtectedRoute>
              } />
              
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
              <Route path="/profile-settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
              
              {/* Settings routes - most require admin permissions */}
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/settings/storage" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/settings/recordings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/settings/alerts" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/settings/webhooks" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/settings/advanced" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/settings/database" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/settings/logs" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/settings/system" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<ProtectedRoute adminRequired={true}><Admin /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute adminRequired={true}><UserManagement /></ProtectedRoute>} />
              <Route path="/admin/users/create" element={<ProtectedRoute superadminRequired={true}><CreateUser /></ProtectedRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SidebarProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Role-based redirect component
const RoleBasedRedirect = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <Navigate to="/dashboard" replace /> : <Navigate to="/live" replace />;
};

export default App;
