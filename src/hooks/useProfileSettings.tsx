
import { useProfileData } from './profile/useProfileData';
import { useAvatarManagement } from './profile/useAvatarManagement';
import { useProfileUpdates } from './profile/useProfileUpdates';
import { usePasswordUpdate } from './profile/usePasswordUpdate';
import { useRoleManagement } from './profile/useRoleManagement';

export function useProfileSettings() {
  const { user, loading, formData, handleInputChange } = useProfileData();
  const { avatarPreview, handleAvatarChange, getInitials } = useAvatarManagement();
  const { updateInProgress: profileUpdateInProgress, handleProfileUpdate } = useProfileUpdates(user?.id);
  const { updateInProgress: passwordUpdateInProgress, handlePasswordUpdate } = usePasswordUpdate();
  const { role } = useRoleManagement(user?.id);

  const handleProfileUpdateWrapper = (e: React.FormEvent) => {
    handleProfileUpdate(e, formData.fullName);
  };

  const handlePasswordUpdateWrapper = (e: React.FormEvent) => {
    const updatedPasswordData = handlePasswordUpdate(e, {
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword
    });
    
    if (updatedPasswordData) {
      // If password update was successful, reset password fields
      handleInputChange({
        target: { name: 'currentPassword', value: '' }
      } as React.ChangeEvent<HTMLInputElement>);
      
      handleInputChange({
        target: { name: 'newPassword', value: '' }
      } as React.ChangeEvent<HTMLInputElement>);
      
      handleInputChange({
        target: { name: 'confirmPassword', value: '' }
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const updateInProgress = profileUpdateInProgress || passwordUpdateInProgress;

  return {
    user,
    loading,
    formData,
    avatarPreview,
    role,
    updateInProgress,
    handleInputChange,
    handleAvatarChange,
    handleProfileUpdate: handleProfileUpdateWrapper,
    handlePasswordUpdate: handlePasswordUpdateWrapper,
    getInitials
  };
}
