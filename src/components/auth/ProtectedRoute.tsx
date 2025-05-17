
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Loader2 } from 'lucide-react';

type ProtectedRouteProps = {
  children: React.ReactNode;
  adminRequired?: boolean;  // Make sure this property exists in the type
};

const ProtectedRoute = ({ children, adminRequired = false }: ProtectedRouteProps) => {
  const { user, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  // Prevent rendering until auth state is determined
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If no user is logged in, redirect to the auth page
  if (!user) {
    console.log("Protected route: No user found, redirecting to /auth");
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // If admin access is required but user is not an admin, redirect to home
  if (adminRequired && !isAdmin) {
    console.log("Protected route: Admin access required but user is not admin, redirecting to /");
    return <Navigate to="/" replace />;
  }

  // User is authenticated (and is admin if required), allow access to the route
  console.log("Protected route: Access granted");
  return <>{children}</>;
};

export default ProtectedRoute;
