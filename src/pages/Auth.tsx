
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // This function will be a placeholder that shows a toast message
  // encouraging users to connect Supabase
  const handleConnectSupabase = () => {
    setIsLoading(true);
    
    try {
      toast({
        title: "Supabase Connection Required",
        description: "Please click on the green Supabase button in the top right to connect your Supabase account.",
        variant: "default"
      });
      
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Connection Error",
        description: "There was an error connecting to Supabase.",
        variant: "destructive"
      });
    }
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
            <CardTitle className="text-xl text-center">Welcome to Vision Hub</CardTitle>
            <CardDescription className="text-center">Connect to Supabase for full functionality</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-blue-950/50 p-4 text-center">
              <Database className="mx-auto h-12 w-12 text-blue-400 mb-2" />
              <h3 className="text-lg font-medium text-blue-100">Authentication with Supabase</h3>
              <p className="mt-2 text-sm text-blue-300">
                For secure authentication and database features, connect your project to Supabase.
              </p>
            </div>
            
            <Button 
              onClick={handleConnectSupabase} 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={isLoading}
            >
              {isLoading ? "Connecting..." : "Connect to Supabase"}
            </Button>
            
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
            
            <Button
              variant="outline"
              onClick={handleLocalAdminLogin}
              className="w-full"
              disabled={isLoading}
            >
              Continue with Local Admin
            </Button>
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
