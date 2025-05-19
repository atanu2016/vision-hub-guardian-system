
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme/theme-provider"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth"; 
import { usePermissions } from "@/hooks/permissions"; 

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
              
              {/* Redirect root to dashboard for superadmin, live view for others */}
              <Route path="/" element={
                <ProtectedRoute>
                  <RoleBasedRedirect />
                </ProtectedRoute>
              } />
              
              {/* Dashboard - accessible only to superadmin */}
              <Route path="/dashboard" element={
                <ProtectedRoute requiredPermission="view-dashboard">
                  <Index />
                </ProtectedRoute>
              } />
              
              {/* Basic views */}
              <Route path="/cameras" element={
                <ProtectedRoute requiredPermission="view-cameras:all">
                  <Cameras />
                </ProtectedRoute>
              } />
              <Route path="/cameras/:id" element={
                <ProtectedRoute requiredPermission="view-cameras:all">
                  <CameraDetail />
                </ProtectedRoute>
              } />
              <Route path="/live" element={
                <ProtectedRoute requiredPermission="view-cameras:assigned">
                  <LiveView />
                </ProtectedRoute>
              } />
              
              {/* Recordings - require view-footage permission */}
              <Route path="/recordings" element={
                <ProtectedRoute requiredPermission="view-footage:assigned">
                  <Recordings />
                </ProtectedRoute>
              } />
              
              <Route path="/notifications" element={
                <ProtectedRoute requiredPermission="view-cameras:assigned">
                  <Notifications />
                </ProtectedRoute>
              } />
              
              {/* Profile - available to all authenticated users */}
              <Route path="/profile" element={
                <ProtectedRoute requiredPermission="view-profile">
                  <ProfileSettings />
                </ProtectedRoute>
              } />
              <Route path="/profile-settings" element={
                <ProtectedRoute requiredPermission="view-profile">
                  <ProfileSettings />
                </ProtectedRoute>
              } />
              
              {/* Settings routes - superadmin only */}
              <Route path="/settings" element={
                <ProtectedRoute requiredPermission="configure-global-policies">
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/settings/storage" element={
                <ProtectedRoute requiredPermission="configure-storage">
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/settings/recordings" element={
                <ProtectedRoute requiredPermission="configure-global-policies">
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/settings/alerts" element={
                <ProtectedRoute requiredPermission="configure-global-policies">
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/settings/webhooks" element={
                <ProtectedRoute requiredPermission="configure-global-policies">
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/settings/advanced" element={
                <ProtectedRoute requiredPermission="manage-system">
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/settings/database" element={
                <ProtectedRoute requiredPermission="manage-system">
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/settings/logs" element={
                <ProtectedRoute requiredPermission="access-logs">
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/settings/system" element={
                <ProtectedRoute requiredPermission="manage-system">
                  <Settings />
                </ProtectedRoute>
              } />
              
              {/* Admin routes - superadmin only */}
              <Route path="/admin" element={
                <ProtectedRoute requiredPermission="manage-users:lower">
                  <Admin />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute requiredPermission="manage-users:lower">
                  <UserManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/users/create" element={
                <ProtectedRoute requiredPermission="manage-users:all">
                  <CreateUser />
                </ProtectedRoute>
              } />
              
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
  const { role } = useAuth();
  
  console.log("RoleBasedRedirect - User role:", role);
  
  // For superadmin, go to dashboard
  if (role === 'superadmin') {
    console.log("RoleBasedRedirect - Redirecting superadmin to dashboard");
    return <Navigate to="/dashboard" replace />;
  }
  
  // For all other roles, go to live view
  console.log("RoleBasedRedirect - Redirecting to live view");
  return <Navigate to="/live" replace />;
};

export default App;
