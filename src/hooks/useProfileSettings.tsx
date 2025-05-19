
import { useState } from 'react';
import { useProfileData } from './profile/useProfileData';
import { useAvatarManagement } from './profile/useAvatarManagement';
import { useProfileUpdates } from './profile/useProfileUpdates';
import { usePasswordUpdate } from './profile/usePasswordUpdate';
import { useRoleManagement } from './profile/useRoleManagement';

export function useProfileSettings() {
  const { user, loading: isLoading, formData, role: userRole, handleInputChange } = useProfileData();
  const { avatarPreview, handleAvatarChange, getInitials } = useAvatarManagement();
  const { updateInProgress: profileUpdateInProgress, handleProfileUpdate } = useProfileUpdates(user?.id);
  const { updateInProgress: passwordUpdateInProgress, handlePasswordUpdate } = usePasswordUpdate();

  const [isSaving, setIsSaving] = useState(false);
  
  const handleSaveChanges = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      await handleProfileUpdate(new Event('submit') as unknown as React.FormEvent, formData.fullName);
    } finally {
      setIsSaving(false);
    }
  };

  const setFullName = (name: string) => {
    handleInputChange({
      target: { name: 'fullName', value: name }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return {
    user,
    isLoading,
    fullName: formData.fullName,
    email: formData.email,
    userRole,
    isSaving: isSaving || profileUpdateInProgress || passwordUpdateInProgress,
    setFullName,
    handleSaveChanges,
    
    // For backwards compatibility with current ProfileSettings.tsx
    loading: isLoading,
    formData,
    avatarPreview,
    role: userRole,
    handleInputChange,
    handleAvatarChange,
    handleProfileUpdate,
    handlePasswordUpdate,
    getInitials
  };
}
