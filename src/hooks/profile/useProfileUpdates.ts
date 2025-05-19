
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useProfileUpdates(userId?: string) {
  const [updateInProgress, setUpdateInProgress] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent, fullName: string): Promise<void> => {
    e.preventDefault();
    if (!userId) {
      toast.error("No user ID available");
      return;
    }

    setUpdateInProgress(true);
    try {
      console.log("[PROFILE UPDATE] Updating profile for user:", userId, "with name:", fullName);
      
      // Use the new security definer function to safely update the profile
      const { data, error } = await supabase
        .rpc('update_user_profile_safe', {
          profile_id: userId,
          profile_full_name: fullName
        });
      
      if (error) {
        console.error("[PROFILE UPDATE] Error updating profile:", error);
        throw error;
      }
      
      if (data) {
        console.log("[PROFILE UPDATE] Profile updated successfully");
        toast.success('Profile updated successfully');
      } else {
        // Fallback to direct insert/update if RPC failed
        console.log("[PROFILE UPDATE] Using fallback direct update method");
        
        // First check if profile exists using direct query
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .maybeSingle();
        
        if (checkError) {
          console.error("[PROFILE UPDATE] Error checking profile:", checkError);
        }
        
        let success = false;
        
        if (existingProfile) {
          // Update existing profile
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              full_name: fullName,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
            
          if (updateError) {
            console.error("[PROFILE UPDATE] Update error:", updateError);
            throw updateError;
          }
          success = true;
        } else {
          // Create new profile
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              full_name: fullName,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            console.error("[PROFILE UPDATE] Insert error:", insertError);
            throw insertError;
          }
          success = true;
        }
        
        if (success) {
          console.log("[PROFILE UPDATE] Profile updated successfully via fallback");
          toast.success('Profile updated successfully');
        }
      }
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
