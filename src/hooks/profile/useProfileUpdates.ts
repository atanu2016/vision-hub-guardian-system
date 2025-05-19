
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
      console.log("[PROFILE UPDATE] Updating profile for user:", userId, "with name:", fullName);
      
      // Check if the profile exists first
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 means no rows returned - that's expected if the profile doesn't exist yet
        console.error("[PROFILE UPDATE] Error checking profile:", checkError);
        throw checkError;
      }

      if (existingProfile) {
        console.log("[PROFILE UPDATE] Updating existing profile");
        
        // Update the profile directly using from() instead of rpc()
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: fullName,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) {
          console.error("[PROFILE UPDATE] Error updating profile:", error);
          throw error;
        }
      } else {
        console.log("[PROFILE UPDATE] Creating new profile");
        // Create new profile
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            full_name: fullName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error("[PROFILE UPDATE] Error creating profile:", error);
          throw error;
        }
      }
      
      console.log("[PROFILE UPDATE] Profile updated successfully");
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('[PROFILE UPDATE] Error updating profile:', error);
      toast.error(error?.message || 'Failed to update profile');
    } finally {
      setUpdateInProgress(false);
    }
  };

  // Create a wrapper function with the signature expected by PersonalInfoCard
  const handleProfileUpdateWrapper = (e: React.FormEvent): void => {
    e.preventDefault();
    // This is just a wrapper to match the signature expected by the component
    console.log("Profile update wrapper called");
  };

  return {
    updateInProgress,
    handleProfileUpdate,
    // For compatibility with existing components
    handleProfileUpdateWrapper
  };
}
