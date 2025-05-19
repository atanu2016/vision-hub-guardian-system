
import { useState } from 'react';
import { useProfileData } from './profile/useProfileData';
import { useAvatarManagement } from './profile/useAvatarManagement';
import { useProfileUpdates } from './profile/useProfileUpdates';
import { usePasswordUpdate, PasswordData } from './profile/usePasswordUpdate';
import { useRoleManagement } from './profile/useRoleManagement';
import { UserRole } from '@/types/admin';

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
      // Create a synthetic event since we don't need the actual event data
      const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
      await handleProfileUpdate(syntheticEvent, formData.fullName);
    } finally {
      setIsSaving(false);
    }
  };

  const setFullName = (name: string) => {
    handleInputChange({
      target: { name: 'fullName', value: name }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  // Create wrapper functions that match the expected signatures in the ProfileSettings component
  const handleProfileUpdateWrapper = (e: React.FormEvent) => {
    e.preventDefault();
    return handleProfileUpdate(e, formData.fullName);
  };
  
  const handlePasswordUpdateWrapper = (e: React.FormEvent) => {
    e.preventDefault();
    const passwordData: PasswordData = {
      currentPassword: formData.currentPassword || '',
      newPassword: formData.newPassword || '',
      confirmPassword: formData.confirmPassword || ''
    };
    return handlePasswordUpdate(e, passwordData);
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
    
    // For backward compatibility with current ProfileSettings.tsx
    loading: isLoading,
    formData,
    avatarPreview,
    role: userRole,
    handleInputChange,
    handleAvatarChange,
    handleProfileUpdate: handleProfileUpdateWrapper,
    handlePasswordUpdate: handlePasswordUpdateWrapper,
    getInitials
  };
}
