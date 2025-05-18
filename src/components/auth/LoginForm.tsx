
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
    isLoading,
    loginAttemptCount
  } = useAuthForm({ 
    onSuccess: () => {
      console.log('Login successful, triggering onSuccess');
      toast.success('Login successful!');
      if (onSuccess) {
        setTimeout(() => onSuccess(), 300);
      }
    }
  });

  useEffect(() => {
    console.log('LoginForm rendered. showCreateAdmin:', showCreateAdmin, 'adminCheckComplete:', adminCheckComplete, 'isLoading:', isLoading);
  }, [showCreateAdmin, adminCheckComplete, isLoading]);

  const onLoginSubmit = async (values: LoginFormValues) => {
    try {
      console.log('Login form submitting with:', values.email);
      const success = await handleLogin(values);
      
      if (success) {
        console.log('Login successful in form handler');
        toast.success(`Welcome back, ${values.email}`);
      }
    } catch (error) {
      console.log('Login form error handler:', error);
    }
  };

  if (emailLoginsDisabled) {
    return <EmailLoginsDisabledAlert onRetry={() => setEmailLoginsDisabled(false)} />;
  }

  // Show a loading state while checking for admin users
  if (!adminCheckComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Checking system configuration...</p>
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
