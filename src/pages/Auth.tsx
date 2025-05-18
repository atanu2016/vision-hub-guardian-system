
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { AuthBranding } from '@/components/auth/AuthBranding';
import { MFAEnrollmentForm } from '@/components/auth/MFAEnrollmentForm';
import { toast } from 'sonner';

const Auth = () => {
  const { user, isLoading, requiresMFA, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [authStarted, setAuthStarted] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const location = useLocation();
  
  // Get the return path from location state, or default to dashboard for admins, live view for others
  const getDefaultPath = () => {
    if (isAdmin) return '/dashboard';
    return '/live';
  };
  
  const from = location.state?.from || getDefaultPath();
  
  const { backgroundUrl, LogoComponent } = AuthBranding();
  
  // Add debugging to track authentication state transitions
  useEffect(() => {
    console.log("[Auth Page] Initial render - isLoading:", isLoading, "user:", !!user, "requiresMFA:", requiresMFA, "isAdmin:", isAdmin);
    
    if (!authStarted) {
      setAuthStarted(true);
      console.log("[Auth Page] Authentication process started");
    }
  }, []);
  
  useEffect(() => {
    console.log("[Auth Page] Auth state changed - isLoading:", isLoading, "user:", !!user, "requiresMFA:", requiresMFA, "isAdmin:", isAdmin);
    
    // Handle successful authentication with a short delay to ensure state is fully updated
    if (user && !isLoading && !redirecting) {
      setRedirecting(true);
      
      // Add a small delay before redirect to ensure all auth data is processed
      const redirectTimeout = setTimeout(() => {
        console.log("[Auth Page] Redirecting authenticated user to:", isAdmin ? "/dashboard" : from);
        // The actual redirect happens in the render below
      }, 100);
      
      return () => clearTimeout(redirectTimeout);
    }
  }, [isLoading, user, requiresMFA, isAdmin, from, redirecting]);

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
  
  // Fast path for authenticated users
  if (user) {
    // If MFA is required but not enrolled, show enrollment form
    if (requiresMFA) {
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
    
    console.log("[Auth Page] User is authenticated, redirecting to", isAdmin ? "/dashboard" : from, "isAdmin:", isAdmin);
    toast.success(`Welcome back!`);
    
    return <Navigate to={isAdmin ? "/dashboard" : from} replace />;
  }

  const containerStyle = backgroundUrl 
    ? { backgroundImage: `url(${backgroundUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } 
    : {};

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
                <LoginForm />
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
