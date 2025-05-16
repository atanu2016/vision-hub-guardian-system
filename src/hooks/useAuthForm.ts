import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { LoginFormValues } from '@/components/auth/forms/LoginFormSchema';

interface UseAuthFormProps {
  onSuccess?: () => void;
}

export const useAuthForm = ({ onSuccess }: UseAuthFormProps = {}) => {
  const [emailLoginsDisabled, setEmailLoginsDisabled] = useState(false);

  const handleLogin = async (values: LoginFormValues) => {
    try {
      console.log('Attempting to sign in with:', values.email);
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password
      });
      
      if (error) {
        // Check for the specific "Email logins are disabled" error
        if (error.message?.includes('Email logins are disabled')) {
          setEmailLoginsDisabled(true);
          toast.error('Email logins are disabled in Supabase settings');
          return;
        } 
        // Database error handling
        else if (error.message?.includes('Database error querying schema')) {
          toast.error('Database setup issue. Try creating an admin account first.');
          throw error;
        } 
        // Other errors
        else {
          toast.error(error.message || 'Login failed. Please check your credentials.');
          throw error;
        }
      }
      
      console.log('Sign in successful');
      toast.success('Successfully signed in');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // Re-throw for parent component handling
      throw error;
    }
  };

  return {
    emailLoginsDisabled,
    setEmailLoginsDisabled,
    handleLogin
  };
};
