
import { supabase } from '@/integrations/supabase/client';
import type { UserRole, UserData } from '@/types/admin';

/**
 * Fetches all users with their roles and profile data
 */
export async function fetchUsers(): Promise<UserData[]> {
  try {
    console.log('Fetching users from database...');
    
    // Get users from the Auth API
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      throw authError;
    }

    if (!authData?.users || authData.users.length === 0) {
      console.log('No users found');
      return [];
    }

    // Now fetch profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, mfa_enrolled, mfa_required, created_at, is_admin');
    
    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      throw profileError;
    }

    // Create a map of profiles by ID for faster lookup
    const profilesMap = (profiles || []).reduce((acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {} as Record<string, any>);

    // Fetch user roles
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (roleError) {
      console.error('Error fetching user roles:', roleError);
      // Continue execution, not all users might have roles
    }

    // Create a map of roles by user ID
    const rolesMap = (userRoles || []).reduce((acc, item) => {
      acc[item.user_id] = item.role;
      return acc;
    }, {} as Record<string, UserRole>);

    // Combine the data
    const usersData = authData.users.map(user => {
      const profile = profilesMap[user.id] || {
        full_name: null,
        mfa_enrolled: false,
        mfa_required: false,
        is_admin: false
      };
      
      // Determine role from either role table or is_admin flag
      let role: UserRole = 'user';
      if (rolesMap[user.id]) {
        role = rolesMap[user.id];
      } else if (profile.is_admin) {
        role = 'admin';
      }

      return {
        id: user.id,
        email: user.email || 'Unknown email',
        full_name: profile.full_name,
        mfa_enrolled: profile.mfa_enrolled,
        mfa_required: profile.mfa_required,
        created_at: profile.created_at || user.created_at,
        is_admin: profile.is_admin,
        role: role
      };
    });

    console.log(`Successfully processed ${usersData.length} users with roles`);
    return usersData;
  } catch (error) {
    console.error('Error in fetchUsers:', error);
    throw error;
  }
}
