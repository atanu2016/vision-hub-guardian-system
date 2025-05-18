
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
  const [loginAttemptCount, setLoginAttemptCount] = useState(0);
  const { signIn } = useAuth();
  
  const handleLogin = useCallback(async (values: LoginFormValues) => {
    if (isLoading) return;
    
    setIsLoading(true);
    console.log('[AUTH FORM] Attempting login for:', values.email);
    setLoginAttemptCount(prev => prev + 1);
    
    try {
      // Clear any previous errors
      toast.dismiss();
      
      const result = await signIn(values.email, values.password);
      console.log('[AUTH FORM] Login result:', result ? 'success' : 'failed');
      
      if (!result) {
        throw new Error('Login failed. Please check your credentials and try again.');
      }
      
      // Set a brief delay to ensure auth state is fully processed
      setTimeout(() => {
        if (onSuccess) {
          console.log('[AUTH FORM] Triggering onSuccess callback');
          onSuccess();
        }
      }, 500);
      
      return true;
    } catch (error: any) {
      console.error('[AUTH FORM] Login error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('Email logins are not enabled')) {
        setEmailLoginsDisabled(true);
        toast.error('Email logins are not enabled');
      } else if (error.message?.includes('Invalid login credentials') || error.message?.includes('Invalid email or password')) {
        toast.error('Invalid email or password');
      } else {
        toast.error(error.message || 'An error occurred during login');
      }
      
      return false;
    } finally {
      // Use a small timeout to prevent state updates during potential redirects
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  }, [signIn, onSuccess, isLoading]);

  return {
    emailLoginsDisabled,
    setEmailLoginsDisabled,
    handleLogin,
    isLoading,
    loginAttemptCount
  };
}
