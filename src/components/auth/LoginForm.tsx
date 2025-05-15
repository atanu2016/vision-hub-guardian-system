
import { LoginFormUI, FirebaseErrorAlert, SupabaseErrorAlert } from './LoginFormUI';
import { useLoginForm } from './useLoginForm';

type LoginFormProps = {
  onSuccess?: () => void;
};

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const {
    isSubmitting,
    firebaseError,
    supabaseError,
    handleSubmit,
  } = useLoginForm({ onSuccess });

  return (
    <>
      {firebaseError && <FirebaseErrorAlert error={firebaseError} />}
      {supabaseError && <SupabaseErrorAlert error={supabaseError} />}

      <LoginFormUI 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting}
        buttonText="Log in"
        defaultValues={{ 
          email: 'admin@example.com', 
          password: 'admin123' 
        }}
      />
    </>
  );
};
