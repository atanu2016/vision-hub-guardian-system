
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { LoginFormValues } from '@/components/auth/forms/LoginFormSchema';

interface UseAuthFormProps {
  onSuccess?: () => void;
}

export function useAuthForm({ onSuccess }: UseAuthFormProps = {}) {
  const [emailLoginsDisabled, setEmailLoginsDisabled] = useState(false);
  const { signIn } = useAuth();
  
  // Memoize login handler to prevent unnecessary rerenders
  const handleLogin = useCallback(async (values: LoginFormValues) => {
    try {
      await signIn(values.email, values.password);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      // Handle specific error cases
      if (error.message?.includes('Email logins are not enabled')) {
        setEmailLoginsDisabled(true);
      }
      throw error;
    }
  }, [signIn, onSuccess]);

  return {
    emailLoginsDisabled,
    setEmailLoginsDisabled,
    handleLogin
  };
}
