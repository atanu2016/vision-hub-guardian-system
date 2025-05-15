
import { LoginFormUI, FirebaseErrorAlert, ExistingUsersAlert, CreateAdminNotice } from './LoginFormUI';
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

      {existingUsers.length > 0 && (
        <ExistingUsersAlert 
          existingUsers={existingUsers}
          onMakeAdmins={makeAdmins}
          isSubmitting={isSubmitting}
        />
      )}

      {showCreateAdmin ? (
        <>
          <CreateAdminNotice />
          <LoginFormUI 
            onSubmit={handleCreateAdmin} 
            isSubmitting={isSubmitting} 
            buttonText="Create Superadmin Account"
          />
        </>
      ) : (
        <LoginFormUI 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
};
