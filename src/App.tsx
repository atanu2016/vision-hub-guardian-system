
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Index from "./pages/Index";
import LiveView from "./pages/LiveView";
import Recordings from "./pages/Recordings";
import Settings from "./pages/Settings";
import Cameras from "./pages/Cameras";
import CameraDetail from "./pages/CameraDetail";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ProfileSettings from "./pages/ProfileSettings";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./contexts/auth";
import AdminRoutes from "./pages/admin";
import { Toaster } from "./components/ui/sonner";
import { useInitializeApp } from "./hooks/useInitializeApp";
import { SidebarProvider } from "./components/ui/sidebar";

// Individual Settings Pages
import RecordingsPage from "./pages/settings/RecordingsPage";
import WebhooksSettings from "./pages/settings/WebhooksSettings";
import AlertsPage from "./pages/settings/AlertsPage";
import StorageSettings from "./pages/settings/StorageSettings";
import LogsSettings from "./pages/settings/LogsSettings";
import SystemSettings from "./pages/settings/SystemSettings";
import AdvancedSettings from "./pages/settings/AdvancedSettings";

function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <AppContent />
      </SidebarProvider>
    </AuthProvider>
  );
}

function AppContent() {
  // Use the initialization hook to set up sample data
  useInitializeApp();
  
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/auth" element={<Auth />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          }
        />
        <Route
          path="/live"
          element={
            <ProtectedRoute>
              <LiveView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recordings"
          element={
            <ProtectedRoute requiredPermission="view-footage:assigned">
              <Recordings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cameras"
          element={
            <ProtectedRoute requiredPermission="view-cameras:all">
              <Cameras />
            </ProtectedRoute>
          }
        />
        <Route
          path="/camera/:id"
          element={
            <ProtectedRoute>
              <CameraDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile-settings"
          element={
            <ProtectedRoute>
              <ProfileSettings />
            </ProtectedRoute>
          }
        />

        {/* Settings routes */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute requiredPermission="configure-camera-settings">
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/recordings"
          element={
            <ProtectedRoute requiredPermission="configure-camera-settings">
              <RecordingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/alerts"
          element={
            <ProtectedRoute requiredPermission="configure-camera-settings">
              <AlertsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/storage"
          element={
            <ProtectedRoute requiredPermission="configure-storage">
              <StorageSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/webhooks"
          element={
            <ProtectedRoute requiredPermission="manage-webhooks">
              <WebhooksSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/logs"
          element={
            <ProtectedRoute requiredPermission="access-logs">
              <LogsSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/system"
          element={
            <ProtectedRoute requiredPermission="configure-camera-settings">
              <SystemSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/advanced"
          element={
            <ProtectedRoute requiredPermission="system-migration">
              <AdvancedSettings />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute adminRequired>
              <AdminRoutes />
            </ProtectedRoute>
          }
        />

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      <Toaster />
    </>
  );
}

export default App;
