
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Index";
import CameraDetail from "./pages/CameraDetail";
import Settings from "./pages/Settings";
import Cameras from "./pages/Cameras";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Admin from "./pages/Admin";
import ProfileSettings from "./pages/ProfileSettings";
import RecordingsPage from "./pages/settings/RecordingsPage";
import AlertsPage from "./pages/settings/AlertsPage";
import StorageSettings from "./pages/settings/StorageSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/cameras" element={
              <ProtectedRoute>
                <Cameras />
              </ProtectedRoute>
            } />
            <Route path="/cameras/:id" element={
              <ProtectedRoute>
                <CameraDetail />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/settings/recordings" element={
              <ProtectedRoute>
                <RecordingsPage />
              </ProtectedRoute>
            } />
            <Route path="/settings/alerts" element={
              <ProtectedRoute>
                <AlertsPage />
              </ProtectedRoute>
            } />
            <Route path="/settings/storage" element={
              <ProtectedRoute>
                <StorageSettings />
              </ProtectedRoute>
            } />
            <Route path="/profile-settings" element={
              <ProtectedRoute>
                <ProfileSettings />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <Admin />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={
              <ProtectedRoute>
                <NotFound />
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
