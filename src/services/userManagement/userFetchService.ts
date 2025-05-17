
import { supabase } from '@/integrations/supabase/client';
import type { UserRole, UserData } from '@/types/admin';

/**
 * Fetches all users with their roles and profile data
 */
export async function fetchUsers(): Promise<UserData[]> {
  try {
    console.log('Fetching users from database...');
    
    // Use a direct query without joining related tables to avoid recursion
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      throw authError;
    }

    if (!authUsers?.users) {
      return [];
    }

    // Now separately get profile data
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, mfa_enrolled, mfa_required, created_at, is_admin');
    
    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      throw profileError;
    }

    // Create a lookup map for faster access
    const profileMap = profiles.reduce((map, profile) => {
      map[profile.id] = profile;
      return map;
    }, {} as Record<string, any>);

    // Get all roles
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('user_id, role');
      
    if (roleError) {
      console.error('Error fetching user roles:', roleError);
    }
    
    // Create a lookup map for roles
    const roleMap = (roleData || []).reduce((map, item) => {
      map[item.user_id] = item.role;
      return map;
    }, {} as Record<string, UserRole>);

    // Combine data
    const usersWithData = authUsers.users.map(user => {
      const profile = profileMap[user.id] || {
        full_name: null,
        mfa_enrolled: false,
        mfa_required: false,
        is_admin: false,
        created_at: user.created_at
      };
      
      // Determine role from either role table or is_admin flag
      const role = roleMap[user.id] || (profile.is_admin ? 'admin' : 'user');

      return {
        id: user.id,
        email: user.email || 'Unknown email',
        full_name: profile.full_name,
        mfa_enrolled: profile.mfa_enrolled,
        mfa_required: profile.mfa_required,
        created_at: profile.created_at || user.created_at,
        is_admin: profile.is_admin,
        role: role as UserRole
      };
    });

    console.log('Processed users with roles:', usersWithData);
    return usersWithData;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}
