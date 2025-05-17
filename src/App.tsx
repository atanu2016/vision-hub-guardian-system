
import {
  Routes,
  Route,
} from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme/theme-provider"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Cameras from "@/pages/Cameras";
import CameraDetail from "@/pages/CameraDetail";
import LiveView from "@/pages/LiveView";
import Recordings from "@/pages/Recordings";
import Notifications from "@/pages/Notifications";
import ProfileSettings from "@/pages/ProfileSettings";
import Settings from "@/pages/Settings";
import Admin from "@/pages/Admin";
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
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/cameras" element={<ProtectedRoute><Cameras /></ProtectedRoute>} />
            <Route path="/cameras/:id" element={<ProtectedRoute><CameraDetail /></ProtectedRoute>} />
            <Route path="/live" element={<ProtectedRoute><LiveView /></ProtectedRoute>} />
            <Route path="/recordings" element={<ProtectedRoute><Recordings /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/settings/storage" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/settings/recordings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/settings/alerts" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/settings/webhooks" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/settings/advanced" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/settings/database" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/settings/logs" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/settings/system" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminRequired={true}><Admin /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute adminRequired={true}><UserManagement /></ProtectedRoute>} />
            <Route path="/admin/users/create" element={<ProtectedRoute adminRequired={true}><CreateUser /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
