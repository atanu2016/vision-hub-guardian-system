
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Loader2 } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission } from '@/utils/permissionUtils';
import { useState, useEffect } from 'react';

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
  const { user, isLoading: authLoading, isAdmin, role, authInitialized } = useAuth();
  const location = useLocation();
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [hasRequiredPermission, setHasRequiredPermission] = useState(true);
  
  // Check if the app is still initializing
  const isInitializing = authLoading || !authInitialized;
  
  // Prevent rendering until auth state is determined
  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading authentication...</span>
      </div>
    );
  }

  // If no user is logged in, redirect to the auth page
  if (!user) {
    console.log("Protected route: No user found, redirecting to /auth");
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // Use a safer approach with useEffect to check permissions after the component mounts
  // This prevents circular dependencies during initialization
  useEffect(() => {
    if (requiredPermission) {
      try {
        const { hasPermission, isLoading } = usePermissions();
        if (!isLoading) {
          setHasRequiredPermission(hasPermission(requiredPermission));
          setPermissionChecked(true);
        }
      } catch (error) {
        console.warn("Protected route: Permission system error, allowing access:", error);
        // If there's an error checking permissions, we're more permissive
        setHasRequiredPermission(true);
        setPermissionChecked(true);
      }
    } else {
      setPermissionChecked(true);
    }
  }, [requiredPermission, user?.id]);
  
  // Wait for permission check to complete if a permission is required
  if (requiredPermission && !permissionChecked) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Checking permissions...</span>
      </div>
    );
  }
  
  // If a specific permission is required and the user doesn't have it, redirect
  if (requiredPermission && !hasRequiredPermission) {
    console.log(`Protected route: Permission '${requiredPermission}' required but not granted, redirecting to /`);
    return <Navigate to="/" replace />;
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

  // User is authenticated and has required role/permission if specified
  console.log("Protected route: Access granted");
  return <>{children}</>;
};

export default ProtectedRoute;
