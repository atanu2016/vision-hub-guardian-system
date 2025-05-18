
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
      // Try first with maybeSingle to avoid errors if profile doesn't exist
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, is_admin, mfa_enrolled, mfa_required')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      if (!data) {
        console.log("No profile found, creating default profile");
        
        // Create a default profile if none exists
        const defaultProfile = {
          id: userId,
          full_name: user?.email?.split('@')[0] || 'New User',
          is_admin: false,
          mfa_enrolled: false,
          mfa_required: false
        };
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert(defaultProfile);
          
        if (insertError) {
          console.error('Error creating default profile:', insertError);
          return defaultProfile as Profile;
        }
        
        return defaultProfile as Profile;
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
    
    // Try using get_user_role function first - this should prevent recursion
    try {
      console.log("Attempting to use get_user_role function");
      const { data: functionResult, error: functionError } = await supabase
        .rpc('get_user_role', { _user_id: userId });
        
      if (!functionError && functionResult) {
        console.log("Role from function:", functionResult);
        return functionResult as UserRole;
      }
      
      if (functionError) {
        console.warn("Function error:", functionError);
      }
    } catch (functionErr) {
      console.warn("Function error:", functionErr);
    }
    
    // Direct query as fallback, but using maybeSingle to avoid errors
    try {
      console.log("Falling back to direct query");
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data && data.role) {
        console.log("Role fetched directly:", data.role);
        return data.role as UserRole;
      }
      
      if (error) {
        console.warn("Error in direct role query:", error);
      }
    } catch (queryError) {
      console.warn("Exception in direct role query:", queryError);
    }
    
    // If user is admin in profile but no role set, create admin role
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .maybeSingle();
        
      if (profileData?.is_admin) {
        console.log("User is admin in profile but no role found - creating admin role");
        await supabase
          .from('user_roles')
          .upsert({
            user_id: userId,
            role: 'admin'
          });
        return 'admin';
      }
    } catch (profileError) {
      console.warn("Error checking admin status:", profileError);
    }
    
    // Finally, create default user role if nothing found
    try {
      console.log("No role found, creating default user role");
      await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: 'user'
        });
    } catch (insertError) {
      console.warn("Error creating default role:", insertError);
    }
    
    console.log("Defaulting to 'user' role");
    return 'user';
  } catch (error) {
    console.error('Error fetching user role:', error);
    return 'user'; // Default to regular user on error
  }
}
