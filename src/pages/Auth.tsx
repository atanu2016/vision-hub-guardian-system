import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { AuthBranding } from '@/components/auth/AuthBranding';
import { SignupForm } from '@/components/auth/SignupForm';
import { MFAEnrollmentForm } from '@/components/auth/MFAEnrollmentForm';

const Auth = () => {
  const { user, isLoading, requiresMFA } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const location = useLocation();
  
  // Get the return path from location state, or default to '/'
  const from = location.state?.from || '/';
  
  const { backgroundUrl, LogoComponent } = AuthBranding();

  useEffect(() => {
    // Check URL params for tab selection
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && (tab === 'login' || tab === 'reset' || tab === 'signup')) {
      setActiveTab(tab);
    }
  }, [location]);

  console.log("Auth page: isLoading =", isLoading, "user =", !!user, "requiresMFA =", requiresMFA);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (user) {
    // If MFA is required but not enrolled, redirect to MFA enrollment
    if (requiresMFA) {
      console.log("Auth page: MFA required, showing enrollment form");
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
    
    // Otherwise, redirect to the page they were trying to access
    console.log("Auth page: User is logged in, redirecting to", from);
    return <Navigate to={from} replace />;
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
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="reset">Reset</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <LoginForm />
              </TabsContent>

              <TabsContent value="signup">
                <SignupForm />
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
