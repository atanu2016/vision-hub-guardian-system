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
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/cameras" element={
              <ProtectedRoute>
                <AppLayout><Cameras /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/cameras/:id" element={
              <ProtectedRoute>
                <AppLayout><CameraDetail /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <AppLayout><Settings /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <AppLayout><Admin /></AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Update these routes to be real components instead of redirects */}
            <Route path="/recordings" element={
              <ProtectedRoute>
                <AppLayout>
                  <h1 className="text-2xl font-bold tracking-tight mb-4">Recordings</h1>
                  <p className="text-muted-foreground">Manage and access your camera recordings</p>
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/alerts" element={
              <ProtectedRoute>
                <AppLayout>
                  <h1 className="text-2xl font-bold tracking-tight mb-4">Alerts</h1>
                  <p className="text-muted-foreground">View and manage camera alerts and notifications</p>
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/storage" element={
              <ProtectedRoute>
                <AppLayout>
                  <h1 className="text-2xl font-bold tracking-tight mb-4">Storage Management</h1>
                  <p className="text-muted-foreground">Configure and monitor storage for your camera recordings</p>
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="*" element={
              <ProtectedRoute>
                <AppLayout><NotFound /></AppLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
