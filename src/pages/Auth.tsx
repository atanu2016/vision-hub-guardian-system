
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { AuthBranding } from '@/components/auth/AuthBranding';
import { MFAEnrollmentForm } from '@/components/auth/MFAEnrollmentForm';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const { user, isLoading, requiresMFA, isAdmin, isSuperAdmin, authInitialized } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [authStarted, setAuthStarted] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the return path from location state, or default based on role
  const getDefaultPath = () => {
    // Check admin status and return appropriate path
    if (isAdmin || isSuperAdmin) {
      console.log("[Auth Page] User is admin, default path is /dashboard");
      return '/dashboard';
    }
    
    console.log("[Auth Page] User is not admin, default path is /live");
    return '/live';
  };
  
  const from = location.state?.from || getDefaultPath();
  
  const { backgroundUrl, LogoComponent } = AuthBranding();
  
  // Refresh session token if possible
  useEffect(() => {
    const refreshSession = async () => {
      try {
        console.log("[Auth Page] Attempting to refresh session token");
        const { error } = await supabase.auth.refreshSession();
        if (error) {
          console.warn("[Auth Page] Session refresh failed:", error.message);
        } else {
          console.log("[Auth Page] Session refreshed successfully");
        }
      } catch (err) {
        console.error("[Auth Page] Session refresh exception:", err);
      }
    };
    
    // Attempt to refresh the token when the auth page loads
    refreshSession();
  }, []);
  
  // Track authentication state transitions
  useEffect(() => {
    console.log("[Auth Page] Auth state:", { 
      isLoading, 
      user: !!user, 
      requiresMFA, 
      isAdmin, 
      isSuperAdmin,
      initialized: authInitialized 
    });
    
    if (!authStarted) {
      setAuthStarted(true);
      console.log("[Auth Page] Authentication process started");
    }
  }, [isLoading, user, requiresMFA, isAdmin, isSuperAdmin, authInitialized, authStarted]);

  // Handle redirection when user is authenticated
  useEffect(() => {
    // Only redirect when fully initialized, not loading, and user is authenticated
    if (user && !isLoading && authInitialized && !redirecting) {
      console.log("[Auth Page] User authenticated, preparing redirect");
      setRedirecting(true);
      
      // Calculate where to redirect based on role
      let path;
      if (location.state?.from) {
        // If we have a specific return path, use that
        path = location.state.from;
        console.log("[Auth Page] Redirecting to requested path:", path);
      } else if (isAdmin || isSuperAdmin) {
        path = '/dashboard';
        console.log("[Auth Page] Admin user, redirecting to dashboard");
      } else {
        path = '/live';
        console.log("[Auth Page] Regular user, redirecting to live view");
      }
      
      toast.success(`Welcome back${user.email ? `, ${user.email}` : ''}`);
      
      // Use navigate for React Router based navigation with a longer timeout
      // to allow state to fully update
      setTimeout(() => {
        console.log("[Auth Page] Executing redirect now to:", path);
        navigate(path, { replace: true });
      }, 1000);
    }
  }, [isLoading, user, from, redirecting, authInitialized, navigate, requiresMFA, isAdmin, isSuperAdmin, location.state]);

  useEffect(() => {
    // Check URL params for tab selection
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'login' || tab === 'reset') {
      setActiveTab(tab);
    }
  }, [location]);

  // Show a more informative loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-2 bg-vision-dark-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Verifying authentication status...</p>
      </div>
    );
  }
  
  // Fast path for authenticated users needing MFA
  if (user && requiresMFA) {
    console.log("[Auth Page] MFA required, showing enrollment form");
    return (
      <div className="flex min-h-screen items-center justify-center bg-vision-dark-900 p-4 sm:p-8" style={backgroundUrl ? { backgroundImage: `url(${backgroundUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <LogoComponent />
          </div>
          <Card className="border-vision-blue-800/30 bg-vision-dark-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-center">MFA Enrollment Required</CardTitle>
              <CardDescription className="text-center">Please set up multi-factor authentication to proceed</CardDescription>
            </CardHeader>
            <CardContent>
              <MFAEnrollmentForm redirectUrl={from} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  // If user is already authenticated and we're not in a sign-in flow, redirect
  if (user && authInitialized && !isLoading && !redirecting) {
    let redirectPath;
    
    if (location.state?.from) {
      // If we have a specific return path, use that
      redirectPath = location.state.from;
      console.log("[Auth Page] Direct redirect to requested path:", redirectPath);
    } else if (isAdmin || isSuperAdmin) {
      redirectPath = '/dashboard';
      console.log("[Auth Page] Direct redirect to dashboard for admin");
    } else {
      redirectPath = '/live';
      console.log("[Auth Page] Direct redirect to live view");
    }
    
    return <Navigate to={redirectPath} replace />;
  }

  const containerStyle = backgroundUrl 
    ? { backgroundImage: `url(${backgroundUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } 
    : {};

  const handleLoginSuccess = () => {
    console.log("[Auth Page] Login success callback triggered");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-vision-dark-900 p-4 sm:p-8" style={containerStyle}>
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <LogoComponent />
        </div>

        <Card className="border-vision-blue-800/30 bg-vision-dark-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-center">Welcome to Vision Hub</CardTitle>
            <CardDescription className="text-center">Cloud security camera management platform</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="reset">Reset</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <LoginForm onSuccess={handleLoginSuccess} />
              </TabsContent>

              <TabsContent value="reset">
                <ResetPasswordForm />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-xs text-center text-muted-foreground">
              By using this service, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
