
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
      
      // Use our new security definer function that bypasses RLS
      const { data, error } = await supabase
        .rpc('update_user_profile_safe', {
          _user_id: userId,
          _full_name: fullName
        });
      
      if (error) {
        console.error("[PROFILE UPDATE] Error updating profile:", error);
        throw error;
      }
      
      if (data === false) {
        console.warn("[PROFILE UPDATE] Function returned false, potential issue");
        throw new Error("Profile update unsuccessful");
      }
      
      console.log("[PROFILE UPDATE] Profile updated successfully");
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('[PROFILE UPDATE] Error updating profile:', error);
      
      // Fallback method - try direct update if RPC fails
      try {
        console.log("[PROFILE UPDATE] Attempting fallback direct update");
        
        // First check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .maybeSingle();
        
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
            console.error("[PROFILE UPDATE] Fallback update error:", updateError);
            toast.error(updateError.message || 'Failed to update profile');
            return;
          }
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
            console.error("[PROFILE UPDATE] Fallback insert error:", insertError);
            toast.error(insertError.message || 'Failed to create profile');
            return;
          }
        }
        
        console.log("[PROFILE UPDATE] Fallback update successful");
        toast.success('Profile updated successfully');
      } catch (fallbackError: any) {
        console.error('[PROFILE UPDATE] Fallback error:', fallbackError);
        toast.error(fallbackError?.message || 'Failed to update profile');
      }
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
