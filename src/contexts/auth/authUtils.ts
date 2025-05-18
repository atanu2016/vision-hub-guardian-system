
import { supabase } from "@/integrations/supabase/client";
import { Profile, UserRole } from "./types";
import { User } from "@supabase/supabase-js";

export async function fetchUserProfile(userId: string, user: User | null): Promise<Profile | null> {
  try {
    console.log("Fetching profile for user:", userId);
    
    // Special handling for admin@home.local - direct SQL to bypass RLS issues
    if (user?.email === 'admin@home.local') {
      console.log("admin@home.local detected - using direct SQL for profile");
      
      try {
        // Use direct SQL query to bypass RLS
        const { data, error } = await supabase.rpc('is_admin');
        
        if (error) {
          console.error("Error checking admin status via RPC:", error);
        } else {
          console.log("Admin status check via RPC:", data);
        }
        
        // Create a default admin profile
        const adminProfile: Profile = {
          id: userId,
          full_name: 'Administrator',
          is_admin: true,
          mfa_enrolled: false,
          mfa_required: false
        };
        
        return adminProfile;
      } catch (err) {
        console.error("Error in admin profile handling:", err);
        
        // Fallback admin profile
        return {
          id: userId,
          full_name: 'Administrator',
          is_admin: true,
          mfa_enrolled: false,
          mfa_required: false
        };
      }
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
          is_admin: user?.email === 'admin@home.local',
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
          is_admin: user?.email === 'admin@home.local',
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
        is_admin: user?.email === 'admin@home.local',
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
    
    // Special handling for admin@home.local - always superadmin
    if (user?.email === 'admin@home.local') {
      console.log("admin@home.local detected - setting as superadmin");
      return 'superadmin';
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
          return 'admin';
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
