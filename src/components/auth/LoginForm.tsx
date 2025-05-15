
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
  
  // Check if any users exist
  useEffect(() => {
    const checkForUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .single();
        
        if (!error && data && data.count === 0) {
          setShowCreateAdmin(true);
        }
      } catch (error) {
        console.error('Error checking for users:', error);
      }
    };
    
    checkForUsers();
  }, []);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    try {
      await signIn(values.email, values.password);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAdmin = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    try {
      // Register the user first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // Add the user to the profiles table with superadmin role
        const { error: userError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: 'superadmin',
          });
          
        if (userError) throw userError;
        
        // Also add to profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: values.email.split('@')[0],
            is_admin: true,
          });
          
        if (profileError) throw profileError;
        
        toast.success('Superadmin account created successfully! Please log in.');
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
            <p className="text-xs mt-1">No users found. Create a superadmin account to get started.</p>
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
          </form>
        </>
      ) : (
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
        </form>
      )}
    </Form>
  );
};
