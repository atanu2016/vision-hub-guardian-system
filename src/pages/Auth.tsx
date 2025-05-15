
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const resetSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

const Auth = () => {
  const { signIn, resetPassword, user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  
  // Get the return path from location state, or default to '/'
  const from = location.state?.from || '/';

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: '' },
  });

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    try {
      await signIn(values.email, values.password);
      // No need to navigate here as it's handled in AuthContext
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (values: z.infer<typeof resetSchema>) => {
    setIsSubmitting(true);
    try {
      await resetPassword(values.email);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (user) {
    // Redirect to the page they were trying to access, or home
    return <Navigate to={from} replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-vision-dark-900 p-4 sm:p-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="bg-vision-blue-500 p-1.5 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M15.24 2.042a10 10 0 0 1 4.958 13.17M10.66 5.22a7.5 7.5 0 1 1-5.88 13.82"/>
                <circle cx="12" cy="12" r="2.5"/>
                <path d="M20 17.607a10 10 0 0 0-16.465-11"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Vision Hub</h1>
          </div>
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
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="mail@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="********" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        'Log in'
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="reset">
                <Form {...resetForm}>
                  <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
                    <FormField
                      control={resetForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="mail@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending reset email...
                        </>
                      ) : (
                        'Reset password'
                      )}
                    </Button>
                  </form>
                </Form>
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
