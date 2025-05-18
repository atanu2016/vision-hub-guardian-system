
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useAuthForm } from '@/hooks/useAuthForm';
import { LoginFormValues } from './forms/LoginFormSchema';
import { EmailLoginsDisabledAlert } from './forms/AuthErrorAlert';
import { StandardLoginForm } from './forms/StandardLoginForm';
import { CreateAdminForm } from './forms/CreateAdminForm';
import { toast } from 'sonner';

type LoginFormProps = {
  onSuccess?: () => void;
};

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const { 
    showCreateAdmin, 
    setShowCreateAdmin, 
    adminCheckComplete 
  } = useAdminCheck();

  const {
    emailLoginsDisabled,
    setEmailLoginsDisabled,
    handleLogin,
    isLoading
  } = useAuthForm({ onSuccess });

  useEffect(() => {
    // Additional logging to help debug authentication loops
    console.log('LoginForm rendered. showCreateAdmin:', showCreateAdmin, 'adminCheckComplete:', adminCheckComplete);
  }, [showCreateAdmin, adminCheckComplete]);

  const onLoginSubmit = async (values: LoginFormValues) => {
    try {
      console.log('Login form submitting with:', values.email);
      await handleLogin(values);
    } catch (error) {
      // Error is handled in useAuthForm
      console.log('Login form error handler:', error);
    }
  };

  if (emailLoginsDisabled) {
    return <EmailLoginsDisabledAlert onRetry={() => setEmailLoginsDisabled(false)} />;
  }

  // Show a loading state while checking for admin users
  if (!adminCheckComplete) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return showCreateAdmin 
    ? <CreateAdminForm onBackToLogin={() => setShowCreateAdmin(false)} />
    : <StandardLoginForm 
        onSubmit={onLoginSubmit} 
        showCreateAdminButton={false}
        isLoading={isLoading}
      />;
};
