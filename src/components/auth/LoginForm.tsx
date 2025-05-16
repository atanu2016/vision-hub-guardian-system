
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  
  // We'll show the admin creation form immediately to avoid database errors
  useEffect(() => {
    const initialCheck = async () => {
      try {
        // Try to count users safely
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.warn('Error checking profiles, defaulting to admin creation:', error);
          setShowCreateAdmin(true);
          return;
        }
        
        if (count === 0) {
          console.log('No users found, showing create admin form');
          setShowCreateAdmin(true);
        } else {
          console.log('Users found:', count);
        }
      } catch (error) {
        console.error('Error checking for users, defaulting to admin creation:', error);
        setShowCreateAdmin(true);
      }
    };
    
    initialCheck();
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
      // More user-friendly error message
      if (error.message?.includes('Database error querying schema')) {
        toast.error('Database setup issue. Try creating an admin account first.');
      } else {
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
      
      if (authError) throw authError;
      
      if (authData.user) {
        console.log('User created:', authData.user.id);
        
        // Add to profiles table first
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
          .insert({
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
