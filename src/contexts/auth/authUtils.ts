
import { supabase } from "@/integrations/supabase/client";
import { Profile, UserRole } from "./types";
import { User } from "@supabase/supabase-js";

export async function fetchUserProfile(userId: string, user: User | null): Promise<Profile | null> {
  try {
    console.log("Fetching profile for user:", userId);
    
    // Special handling for admin@home.local
    if (user?.email === 'admin@home.local') {
      console.log("admin@home.local detected - ensuring admin status");
      
      // Make sure they're set as admin in profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (profileError || !profileData || !profileData.is_admin) {
        // Create or update admin profile
        await supabase
          .from('profiles')
          .upsert({
            id: userId,
            full_name: 'Administrator',
            is_admin: true,
            mfa_required: false
          });
          
        // Also ensure role is set
        await supabase
          .from('user_roles')
          .upsert({
            user_id: userId,
            role: 'superadmin'
          });
          
        // Fetch the updated profile
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        return data as Profile;
      }
      
      return profileData as Profile;
    }
    
    // Normal profile fetch with error handling
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, is_admin, mfa_enrolled, mfa_required')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      console.log("Profile fetched:", data);
      return data as Profile;
    } catch (fetchError) {
      console.error('Error in profile fetch:', fetchError);
      return null;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function fetchUserRole(userId: string, user: User | null): Promise<UserRole> {
  try {
    console.log("Fetching role for user:", userId);
    
    // Special handling for admin@home.local - always superadmin
    if (user?.email === 'admin@home.local') {
      console.log("admin@home.local detected - setting as superadmin");
      
      // Ensure they have superadmin role
      await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: 'superadmin'
        });
      
      return 'superadmin';
    }
    
    // Try using get_user_role function first
    try {
      const { data: functionResult, error: functionError } = await supabase
        .rpc('get_user_role', { _user_id: userId });
        
      if (!functionError && functionResult) {
        console.log("Role from function:", functionResult);
        return functionResult as UserRole;
      }
    } catch (functionErr) {
      console.warn("Function error:", functionErr);
      // Fall through to regular query
    }
    
    // Normal role fetch as fallback
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) {
      console.log("Role fetched directly:", data.role);
      return data.role as UserRole;
    }
    
    console.log("No role found, defaulting to 'user'");
    return 'user'; // Default to regular user
    
  } catch (error) {
    console.error('Error fetching user role:', error);
    return 'user'; // Default to regular user on error
  }
}
