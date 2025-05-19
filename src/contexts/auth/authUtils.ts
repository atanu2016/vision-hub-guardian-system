
import { supabase } from "@/integrations/supabase/client";
import { Profile, UserRole } from "./types";
import { User } from "@supabase/supabase-js";

export async function fetchUserProfile(userId: string, user: User | null): Promise<Profile | null> {
  try {
    console.log("Fetching profile for user:", userId);
    
    // Special handling for admin@home.local and superadmin@home.local
    if (user?.email === 'admin@home.local' || user?.email === 'superadmin@home.local') {
      console.log("Special admin account detected - using direct profile creation");
      
      // Create a default admin profile
      const adminProfile: Profile = {
        id: userId,
        full_name: user?.email === 'superadmin@home.local' ? 'Super Administrator' : 'Administrator',
        is_admin: true,
        mfa_enrolled: false,
        mfa_required: false
      };
      
      return adminProfile;
    }
    
    // Normal profile fetch with error handling and fallback
    try {
      console.log("Attempting to fetch profile from database");
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, is_admin, mfa_enrolled, mfa_required')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        // Create a fallback profile object
        return {
          id: userId,
          full_name: user?.email?.split('@')[0] || 'User',
          is_admin: false,
          mfa_enrolled: false,
          mfa_required: false
        };
      }
      
      if (!data) {
        console.log("No profile found, creating default profile");
        
        // Create a default profile
        const defaultProfile = {
          id: userId,
          full_name: user?.email?.split('@')[0] || 'New User',
          is_admin: false,
          mfa_enrolled: false,
          mfa_required: false
        };
        
        return defaultProfile as Profile;
      }
      
      console.log("Profile fetched:", data);
      return data as Profile;
    } catch (fetchError) {
      console.error('Error in profile fetch:', fetchError);
      // Create a fallback profile if all else fails
      return {
        id: userId,
        full_name: user?.email?.split('@')[0] || 'User',
        is_admin: false,
        mfa_enrolled: false,
        mfa_required: false
      };
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function fetchUserRole(userId: string, user: User | null): Promise<UserRole> {
  try {
    console.log("Fetching role for user:", userId);
    
    // Special handling for admin accounts
    if (user?.email === 'admin@home.local' || user?.email === 'superadmin@home.local') {
      console.log("admin@home.local or superadmin@home.local detected - setting as superadmin");
      return 'superadmin';
    }
    
    // Try our custom function first to avoid RLS issues
    try {
      console.log("Attempting to use get_user_role function");
      const { data: roleData, error: roleError } = await supabase.rpc('get_user_role');
      
      if (!roleError && roleData) {
        console.log("Role retrieved via function:", roleData);
        return roleData as UserRole;
      }
    } catch (fnError) {
      console.warn("Error using get_user_role function:", fnError);
    }
    
    // Try direct role query with fallback
    try {
      console.log("Attempting direct role query");
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data && data.role) {
        console.log("Role fetched directly:", data.role);
        return data.role as UserRole;
      } else {
        console.log("No specific role found, checking admin status");
        
        // Check if user is admin in profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', userId)
          .maybeSingle();
          
        if (profileData?.is_admin) {
          console.log("User is admin in profile");
          return 'superadmin';
        }
      }
    } catch (queryError) {
      console.warn("Exception in direct role query:", queryError);
    }
    
    // Default role if nothing found
    console.log("Defaulting to 'user' role");
    return 'user';
  } catch (error) {
    console.error('Error fetching user role:', error);
    return 'user'; // Default to regular user on error
  }
}
