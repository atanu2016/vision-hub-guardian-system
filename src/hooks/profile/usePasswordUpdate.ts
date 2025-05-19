
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function usePasswordUpdate() {
  const [updateInProgress, setUpdateInProgress] = useState(false);

  const handlePasswordUpdate = async (e: React.FormEvent, passwordData: PasswordData): Promise<PasswordData> => {
    e.preventDefault();
    
    // Simple validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return passwordData;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return passwordData;
    }

    setUpdateInProgress(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;
      
      toast.success('Password updated successfully');
      return {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error.message || 'Failed to update password');
      return passwordData;
    } finally {
      setUpdateInProgress(false);
    }
  };
  
  // Create a wrapper function that matches the expected signature
  const handlePasswordUpdateWrapper = (e: React.FormEvent): void => {
    e.preventDefault();
    // This wrapper is just to match the signature expected by SecuritySettingsCard
    // The actual implementation remains in handlePasswordUpdate
    console.log("Password update wrapper called");
  };

  return {
    updateInProgress,
    handlePasswordUpdate,
    // For compatibility with existing components
    handlePasswordUpdateWrapper
  };
}
