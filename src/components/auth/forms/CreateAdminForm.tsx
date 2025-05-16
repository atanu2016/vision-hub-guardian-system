
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { loginSchema, LoginFormValues } from './LoginFormSchema';

interface CreateAdminFormProps {
  onBackToLogin: () => void;
}

export const CreateAdminForm = ({ onBackToLogin }: CreateAdminFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleCreateAdmin = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      console.log('Creating admin account with:', values.email);
      
      // Register the user first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: { 
            full_name: values.email.split('@')[0] 
          }
        }
      });
      
      if (authError) {
        // Check for email logins disabled error
        if (authError.message.includes('Email signups are disabled')) {
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
        onBackToLogin();
      }
    } catch (error: any) {
      console.error('Create admin error:', error);
      toast.error(error.message || 'Failed to create admin account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-4 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-md text-amber-800 dark:text-amber-300">
        <h3 className="text-sm font-medium">Create First Admin Account</h3>
        <p className="text-xs mt-1">Create a superadmin account to get started with Vision Hub.</p>
      </div>
      <Form {...form}>
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
            onClick={onBackToLogin}
          >
            Back to Login
          </Button>
        </form>
      </Form>
    </>
  );
};
