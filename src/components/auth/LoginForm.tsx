
import { LoginFormUI, FirebaseErrorAlert } from './LoginFormUI';
import { useLoginForm } from './useLoginForm';

type LoginFormProps = {
  onSuccess?: () => void;
};

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const {
    isSubmitting,
    firebaseError,
    handleSubmit,
  } = useLoginForm({ onSuccess });

  return (
    <>
      {firebaseError && <FirebaseErrorAlert error={firebaseError} />}

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
