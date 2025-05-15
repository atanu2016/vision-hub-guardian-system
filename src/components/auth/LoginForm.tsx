
import { LoginFormUI, FirebaseErrorAlert } from './LoginFormUI';
import { useLoginForm } from './useLoginForm';

type LoginFormProps = {
  onSuccess?: () => void;
};

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const {
    isSubmitting,
    showCreateAdmin,
    firebaseError,
    existingUsers,
    handleSubmit,
    handleCreateAdmin,
    makeAdmins
  } = useLoginForm({ onSuccess });

  return (
    <>
      {firebaseError && <FirebaseErrorAlert error={firebaseError} />}

      <LoginFormUI 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting}
        buttonText="Log in"
      />
    </>
  );
};
