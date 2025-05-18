
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Loader2 } from 'lucide-react';
import { Permission, hasPermission } from '@/utils/permissionUtils';
import { useState, useEffect, useMemo } from 'react';

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
  
  // Prevent rendering until auth state is determined
  const isInitializing = authLoading || !authInitialized;

  // Use a single useEffect for permission checking
  useEffect(() => {
    // Only run the permission check logic if there's a permission required
    // and we're not initializing anymore and we have a user
    if (requiredPermission && !isInitializing && user) {
      try {
        // Check permission
        const result = hasPermission(role, requiredPermission);
        console.log(`Permission check for ${requiredPermission}: ${result}`);
        setHasRequiredPermission(result);
      } catch (error) {
        console.error("Error checking permission:", error);
        setHasRequiredPermission(false);
      } finally {
        setPermissionChecked(true);
      }
    } else if (!requiredPermission || !user) {
      // If no permission is required or no user, mark as checked
      setPermissionChecked(true);
    }
  }, [requiredPermission, role, isInitializing, user]);
  
  // Use useMemo for content rendering logic to ensure consistent hook execution
  return useMemo(() => {
    // Show loading during initialization
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
      console.log(`Protected route: Permission '${requiredPermission}' required but not granted, redirecting to /live`);
      return <Navigate to="/live" replace />;
    }
    
    // If superadmin access is required but user is not a superadmin, redirect to home
    if (superadminRequired && role !== 'superadmin') {
      console.log("Protected route: Superadmin access required but user is not a superadmin, redirecting to /live");
      return <Navigate to="/live" replace />;
    }
    
    // If admin access is required but user is not an admin, redirect to home
    if (adminRequired && !isAdmin) {
      console.log("Protected route: Admin access required but user is not admin, redirecting to /live");
      return <Navigate to="/live" replace />;
    }
    
    // User is authenticated and has required role/permission if specified
    console.log("Protected route: Access granted");
    return children;
  }, [children, user, requiredPermission, permissionChecked, hasRequiredPermission, 
      superadminRequired, adminRequired, isAdmin, role, isInitializing, location.pathname]);
};

export default ProtectedRoute;
