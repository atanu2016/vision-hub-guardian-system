
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireAdmin?: boolean;
};

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If no user is logged in, redirect to the auth page
  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // If admin access is required but user is not an admin, redirect to home
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated (and is admin if required), allow access to the route
  return <>{children}</>;
};

export default ProtectedRoute;
