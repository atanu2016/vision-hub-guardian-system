
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Loader2 } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission } from '@/utils/permissionUtils';

type ProtectedRouteProps = {
  children: React.ReactNode;
  adminRequired?: boolean;
  superadminRequired?: boolean;
  requiredPermission?: Permission;
};

const ProtectedRoute = ({ 
  children, 
  adminRequired = false,
  superadminRequired = false,
  requiredPermission
}: ProtectedRouteProps) => {
  const { user, isLoading, isAdmin, role } = useAuth();
  const { hasPermission, error: permissionError } = usePermissions();
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

  // If there's a permission system error, we need to be more permissive
  if (permissionError) {
    console.warn("Protected route: Permission system error, allowing access:", permissionError);
    return <>{children}</>;
  }

  // If superadmin access is required but user is not a superadmin, redirect to home
  if (superadminRequired && role !== 'superadmin') {
    console.log("Protected route: Superadmin access required but user is not a superadmin, redirecting to /");
    return <Navigate to="/" replace />;
  }

  // If admin access is required but user is not an admin, redirect to home
  if (adminRequired && !isAdmin) {
    console.log("Protected route: Admin access required but user is not admin, redirecting to /");
    return <Navigate to="/" replace />;
  }

  // If specific permission is required, check it
  if (requiredPermission && !hasPermission(requiredPermission)) {
    console.log(`Protected route: Permission '${requiredPermission}' required but not granted, redirecting to /`);
    return <Navigate to="/" replace />;
  }

  // User is authenticated (and has required role/permission if specified), allow access to the route
  console.log("Protected route: Access granted");
  return <>{children}</>;
};

export default ProtectedRoute;
