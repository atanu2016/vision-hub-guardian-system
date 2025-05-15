
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { LoginForm } from '@/components/auth/LoginForm';
import { AuthBranding } from '@/components/auth/AuthBranding';
import { supabase } from '@/integrations/supabase/client';
import { SupabaseConnectionTest } from '@/components/auth/SupabaseConnectionTest';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { LogoComponent } = AuthBranding();
  
  const handleLoginSuccess = () => {
    navigate('/');
  };
  
  // Temporary login with existing local admin
  const handleLocalAdminLogin = () => {
    setIsLoading(true);
    
    try {
      // Import the necessary functions
      import('@/services/userService').then(({ checkLocalAdminLogin, createLocalAdmin }) => {
        // Create local admin and navigate to home
        createLocalAdmin();
        toast({
          title: "Local Admin Mode",
          description: "Logged in with local admin account. For full functionality, connect Supabase.",
          variant: "default"
        });
        
        navigate('/');
      });
    } catch (error) {
      console.error("Error logging in with local admin:", error);
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-vision-dark-900 p-4 sm:p-8">
      <div className="w-full max-w-md">
        <Card className="border-vision-blue-800/30 bg-vision-dark-800/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <LogoComponent />
            </div>
            <CardTitle className="text-xl text-center">Welcome to Vision Hub</CardTitle>
            <CardDescription className="text-center">Sign in to your account</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <LoginForm onSuccess={handleLoginSuccess} />
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-600"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-vision-dark-800 px-2 text-muted-foreground">
                  Or continue with local mode
                </span>
              </div>
            </div>
            
            <button
              onClick={handleLocalAdminLogin}
              className="w-full py-2 px-4 border border-gray-600 rounded-md bg-transparent hover:bg-gray-800 transition-colors text-sm"
              disabled={isLoading}
            >
              Continue with Local Admin
            </button>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <SupabaseConnectionTest />
            <div className="text-xs text-center text-muted-foreground mt-4">
              By using this service, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
