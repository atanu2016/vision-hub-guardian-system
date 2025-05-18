
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { LoginFormValues } from '@/components/auth/forms/LoginFormSchema';

interface UseAuthFormProps {
  onSuccess?: () => void;
}

export function useAuthForm({ onSuccess }: UseAuthFormProps = {}) {
  const [emailLoginsDisabled, setEmailLoginsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  
  // Memoize login handler to prevent unnecessary rerenders
  const handleLogin = useCallback(async (values: LoginFormValues) => {
    if (isLoading) return;
    
    setIsLoading(true);
    console.log('[AUTH FORM] Attempting login for:', values.email);
    
    try {
      // Add timeout to prevent infinite loading state
      const loginPromise = signIn(values.email, values.password);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Login timed out. Please try again.')), 20000)
      );
      
      await Promise.race([loginPromise, timeoutPromise]);
      console.log('[AUTH FORM] Login successful');
      
      // Clear any previous errors
      toast.dismiss();
      
      // Delay the onSuccess callback slightly to ensure authentication state is fully processed
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 200);
      }
      
      // Toast is now handled by the Auth component to avoid duplicate messages
    } catch (error: any) {
      console.error('[AUTH FORM] Login error:', error);
      toast.dismiss(); // Clear any previous toasts
      
      // Handle specific error cases
      if (error.message?.includes('Email logins are not enabled')) {
        setEmailLoginsDisabled(true);
        toast.error('Email logins are not enabled');
      } else if (error.message?.includes('Invalid login credentials')) {
        toast.error('Invalid email or password');
      } else if (error.message?.includes('timed out')) {
        toast.error(error.message);
      } else {
        toast.error(error.message || 'An error occurred during login');
      }
      
      throw error;
    } finally {
      // Use a small timeout to prevent state updates during potential redirects
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    }
  }, [signIn, onSuccess, isLoading]);

  return {
    emailLoginsDisabled,
    setEmailLoginsDisabled,
    handleLogin,
    isLoading
  };
}
