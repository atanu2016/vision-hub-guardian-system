
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
      
      // First check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
      
      if (existingProfile) {
        // Update existing profile - avoid joins that might trigger RLS recursion
        const { error: updateError } = await supabase.rpc('update_profile', {
          user_id: userId,
          full_name_param: fullName
        });

        if (updateError) {
          console.error("[PROFILE UPDATE] RPC Error updating profile:", updateError);
          
          // Fall back to direct update if RPC fails
          const { error: directUpdateError } = await supabase
            .from('profiles')
            .update({
              full_name: fullName,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
            
          if (directUpdateError) throw directUpdateError;
        }
      } else {
        // Create new profile with direct insert to avoid RLS issues
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            full_name: fullName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();

        if (insertError) {
          console.error("[PROFILE UPDATE] Error creating profile:", insertError);
          
          // If we get duplicate key, the profile was created in the meantime, so try update instead
          if (insertError.code === '23505') { // PostgreSQL unique constraint violation
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ full_name: fullName })
              .eq('id', userId);
              
            if (updateError) throw updateError;
          } else {
            throw insertError;
          }
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
