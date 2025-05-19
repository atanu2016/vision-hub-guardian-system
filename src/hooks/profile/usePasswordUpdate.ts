
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function usePasswordUpdate() {
  const [updateInProgress, setUpdateInProgress] = useState(false);

  const handlePasswordUpdate = async (e: React.FormEvent, passwordData: PasswordData) => {
    e.preventDefault();
    
    // Simple validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
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

  return {
    updateInProgress,
    handlePasswordUpdate
  };
}
