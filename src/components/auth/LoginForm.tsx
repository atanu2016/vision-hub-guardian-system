
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormProps = {
  onSuccess?: () => void;
};

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const { signIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [emailLoginsDisabled, setEmailLoginsDisabled] = useState(false);
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);
  
  // Check if any admin users exist
  useEffect(() => {
    const checkForAdmins = async () => {
      try {
        // First try to find admin by role
        const { data: adminRoles, error: adminRolesError } = await supabase
          .from('user_roles')
          .select('user_id')
          .in('role', ['admin', 'superadmin'])
          .limit(1);
          
        if (!adminRolesError && adminRoles && adminRoles.length > 0) {
          console.log('Admin found by role:', adminRoles);
          setShowCreateAdmin(false);
          setAdminCheckComplete(true);
          return;
        }
        
        // If no admin roles, check for admin flag in profiles
        const { data: adminProfiles, error: adminProfilesError } = await supabase
          .from('profiles')
          .select('id')
          .eq('is_admin', true)
          .limit(1);
        
        if (!adminProfilesError && adminProfiles && adminProfiles.length > 0) {
          console.log('Admin found by profile flag:', adminProfiles);
          setShowCreateAdmin(false);
          setAdminCheckComplete(true);
          return;
        }
        
        // If we get here, no admins exist - check profile count
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.warn('Error checking profiles:', error);
          // Don't automatically show create admin on error
          setShowCreateAdmin(false);
        } else if (count === 0) {
          console.log('No users found, showing create admin form');
          setShowCreateAdmin(true);
        } else {
          console.log('Users found but no admins:', count);
          setShowCreateAdmin(false);
        }
        
        setAdminCheckComplete(true);
      } catch (error) {
        console.error('Error checking for admin users:', error);
        setShowCreateAdmin(false);
        setAdminCheckComplete(true);
      }
    };
    
    checkForAdmins();
  }, []);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    try {
      console.log('Attempting to sign in with:', values.email);
      await signIn(values.email, values.password);
      console.log('Sign in successful');
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Check for the specific "Email logins are disabled" error
      if (error.message?.includes('Email logins are disabled')) {
        setEmailLoginsDisabled(true);
        toast.error('Email logins are disabled in Supabase settings');
      } 
      // Database error handling
      else if (error.message?.includes('Database error querying schema')) {
        toast.error('Database setup issue. Try creating an admin account first.');
        setShowCreateAdmin(true);
      } 
      // Other errors
      else {
        toast.error(error.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAdmin = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    try {
      console.log('Creating admin account with:', values.email);
      // Register the user first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });
      
      if (authError) {
        // Check for email logins disabled error
        if (authError.message.includes('Email signups are disabled')) {
          setEmailLoginsDisabled(true);
          throw new Error('Email signups are disabled in Supabase settings');
        }
        throw authError;
      }
      
      if (authData.user) {
        console.log('User created:', authData.user.id);
        
        // Add to profiles table first with explicit admin flag
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: values.email.split('@')[0],
            is_admin: true,
            mfa_required: false,
          });
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
          // Try to still create user role even if profile insert fails
        }
        
        // Add the user to the user_roles table with superadmin role
        const { error: userRoleError } = await supabase
          .from('user_roles')
          .upsert({
            user_id: authData.user.id,
            role: 'superadmin',
          });
          
        if (userRoleError) {
          console.error('Error setting user role:', userRoleError);
          // We'll continue even if this fails - they can log in and fix later
        }
          
        toast.success('Admin account created! Please log in.', {
          description: 'You may need to wait a moment for your account to be fully activated.'
        });
        
        // Switch to login mode
        setShowCreateAdmin(false);
      }
    } catch (error: any) {
      console.error('Create admin error:', error);
      toast.error(error.message || 'Failed to create admin account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (emailLoginsDisabled) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Authentication Error</AlertTitle>
        <AlertDescription>
          <p>Email logins are disabled in your Supabase project settings.</p>
          <p className="mt-2">To enable email logins, go to your Supabase dashboard:</p>
          <ol className="list-decimal pl-5 mt-1">
            <li>Navigate to Authentication &gt; Providers</li>
            <li>Enable "Email" provider</li>
            <li>Make sure "Confirm email" is disabled for easier testing</li>
          </ol>
          <Button 
            variant="outline" 
            className="mt-3 w-full"
            onClick={() => setEmailLoginsDisabled(false)}
          >
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Show a loading state while checking for admin users
  if (!adminCheckComplete) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      {showCreateAdmin ? (
        <>
          <div className="mb-4 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-md text-amber-800 dark:text-amber-300">
            <h3 className="text-sm font-medium">Create First Admin Account</h3>
            <p className="text-xs mt-1">Create a superadmin account to get started with Vision Hub.</p>
          </div>
          <form onSubmit={form.handleSubmit(handleCreateAdmin)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Email</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
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
                  Creating admin...
                </>
              ) : (
                'Create Superadmin Account'
              )}
            </Button>
            <Button 
              variant="outline" 
              type="button" 
              className="w-full" 
              onClick={() => setShowCreateAdmin(false)}
            >
              Back to Login
            </Button>
          </form>
        </>
      ) : (
        <>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
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
              control={form.control}
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
            <Button 
              variant="ghost" 
              type="button" 
              className="w-full" 
              onClick={() => setShowCreateAdmin(true)}
            >
              Create Admin Account
            </Button>
          </form>
        </>
      )}
    </Form>
  );
};
