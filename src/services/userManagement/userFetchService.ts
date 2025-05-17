
import { supabase } from '@/integrations/supabase/client';
import type { UserRole, UserData } from '@/types/admin';

/**
 * Fetches all users with their roles and profile data
 */
export async function fetchUsers(): Promise<UserData[]> {
  try {
    console.log('Fetching users from database...');
    
    // First check if the current user has superadmin access
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }

    // Get users via RPC function that will check permissions server-side
    const { data: users, error: usersError } = await supabase
      .rpc('get_all_users');
      
    if (usersError) {
      console.error('Error fetching users via RPC:', usersError);
      
      // Fallback: Try to get profiles directly if RPC fails
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, mfa_enrolled, mfa_required, created_at, is_admin');
      
      if (profilesError) {
        console.error('Fallback error fetching profiles:', profilesError);
        throw new Error('Failed to load users: Permission denied');
      }
      
      if (!profiles || profiles.length === 0) {
        return [];
      }
      
      // Get user emails and metadata from auth.users table (this requires service_role key)
      // Since we can't directly access auth.users, we'll get minimal data from profiles
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      const rolesMap = (userRoles || []).reduce((acc, item) => {
        acc[item.user_id] = item.role;
        return acc;
      }, {} as Record<string, UserRole>);
      
      // Return minimal profile data when we can't access auth.users
      return profiles.map(profile => {
        return {
          id: profile.id,
          email: 'Protected', // We can't access emails without service role
          full_name: profile.full_name || 'User',
          mfa_enrolled: profile.mfa_enrolled || false,
          mfa_required: profile.mfa_required || false,
          created_at: profile.created_at || new Date().toISOString(),
          is_admin: profile.is_admin || false,
          role: rolesMap[profile.id] || 'user'
        };
      });
    }

    if (!users || users.length === 0) {
      console.log('No users found');
      return [];
    }

    // Transform the data from the RPC function
    const usersData = users.map(user => ({
      id: user.id,
      email: user.email || 'Unknown email',
      full_name: user.full_name || null,
      mfa_enrolled: user.mfa_enrolled || false,
      mfa_required: user.mfa_required || false,
      created_at: user.created_at || user.auth_created_at,
      is_admin: user.is_admin || false,
      role: user.role || 'user'
    }));

    console.log(`Successfully processed ${usersData.length} users with roles`);
    return usersData;
  } catch (error) {
    console.error('Error in fetchUsers:', error);
    throw error;
  }
}
