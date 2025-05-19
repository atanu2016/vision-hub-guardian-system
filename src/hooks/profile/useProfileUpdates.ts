
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useProfileUpdates(userId?: string) {
  const [updateInProgress, setUpdateInProgress] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent, fullName: string): Promise<void> => {
    e.preventDefault();
    if (!userId) return;

    setUpdateInProgress(true);
    try {
      // Check if the profile exists first
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 means no rows returned - that's expected if the profile doesn't exist yet
        throw checkError;
      }

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: fullName,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            full_name: fullName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error?.message || 'Failed to update profile');
    } finally {
      setUpdateInProgress(false);
    }
  };

  return {
    updateInProgress,
    handleProfileUpdate
  };
}
