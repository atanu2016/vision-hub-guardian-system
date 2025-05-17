
import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  mfa_required?: boolean;
  mfa_enabled?: boolean;
  created_at?: string;
}

export async function fetchAllUsers(): Promise<User[]> {
  try {
    console.log("Fetching all users...");
    
    // Call the Edge Function to get all users
    const { data: allUsersResponse, error: allUsersError } = await supabase.functions.invoke('get-all-users');
    
    if (allUsersError) {
      console.error('Error fetching all users:', allUsersError);
      throw allUsersError;
    }
    
    if (!allUsersResponse?.users) {
      console.error('No users returned from function');
      return [];
    }
    
    const authUsers = allUsersResponse.users;
    console.log(`Fetched ${authUsers.length} auth users`);
    
    // Get profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
      
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }
    
    const profiles = profilesData || [];
    console.log(`Fetched ${profiles.length} profiles`);
    
    // Get user roles
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');
      
    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
    }
    
    const roles = rolesData || [];
    console.log(`Fetched ${roles.length} role assignments`);

    // Map users to include all necessary information
    return authUsers.map(user => {
      const profile = profiles.find(p => p.id === user.id);
      const roleAssignment = roles.find(r => r.user_id === user.id);
      
      // Determine role from multiple sources for reliability
      let role = 'user'; // Default role
      
      if (roleAssignment?.role) {
        // Primary source: user_roles table
        role = roleAssignment.role;
      } else if (user.user_metadata?.role) {
        // Secondary source: user metadata
        role = user.user_metadata.role;
      } else if (profile?.is_admin) {
        // Fallback: profile.is_admin flag
        role = 'admin';
      }
      
      return {
        id: user.id,
        email: user.email || "No email",
        full_name: profile?.full_name || user.user_metadata?.full_name || "Unknown",
        role: role,
        mfa_required: profile?.mfa_required,
        mfa_enabled: profile?.mfa_enrolled,
        created_at: user.created_at
      };
    });
    
  } catch (error) {
    console.error('Error in fetchAllUsers:', error);
    throw error;
  }
}
