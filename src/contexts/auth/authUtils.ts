
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
    
    // Special handling for operator@home.local
    if (user?.email === 'operator@home.local') {
      console.log("operator@home.local detected - ensuring proper status");
      
      // First check for existing profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      // Create or update profile
      await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: 'Vision Operator',
          is_admin: false,
          mfa_required: false
        });
      
      // Ensure user role is set as user
      console.log("Setting operator@home.local with appropriate role");
      await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: 'user'
        });
      
      // Fetch the updated profile
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      return data as Profile;
    }
    
    // Normal profile fetch
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
    
    // If this is the first user (likely an admin), set admin status if not already set
    if (data && !data.is_admin) {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      if (count === 1) {
        // This is the first and only user, make them admin
        console.log("First user detected, setting as admin");
        await supabase
          .from('profiles')
          .update({ is_admin: true })
          .eq('id', userId);
          
        // Update data to reflect admin status
        return {...data, is_admin: true} as Profile;
      }
    }
    
    return data as Profile;
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
    
    // Special handling for operator@home.local - set as user
    if (user?.email === 'operator@home.local') {
      console.log("operator@home.local detected - setting as user");
      
      // Ensure they have user role
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: 'user'
        });
        
      if (error) {
        console.error("Error setting user role:", error);
      } else {
        console.log("operator@home.local role set successfully");
      }
      
      return 'user';
    }
    
    // Normal role fetch
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user role:', error);
      return 'user'; // Default to regular user on error
    }
    
    console.log("Role data:", data);
    
    if (data) {
      return data.role as UserRole;
    } else {
      // If this is the first user and no role exists, create a superadmin role
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      if (count === 1) {
        // This is the first and only user, make them superadmin
        console.log("First user detected, setting as superadmin");
        await supabase
          .from('user_roles')
          .upsert({ 
            user_id: userId, 
            role: 'superadmin' 
          });
          
        return 'superadmin';
      } else {
        // Default to 'user' if no role is assigned
        return 'user';
      }
    }
  } catch (error) {
    console.error('Error fetching user role:', error);
    return 'user'; // Default to regular user on error
  }
}
