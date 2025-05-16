
import { supabase } from '@/integrations/supabase/client';
import type { UserRole, UserData } from '@/types/admin';

/**
 * Fetches all users with their roles and profile data
 */
export async function fetchUsers(): Promise<UserData[]> {
  try {
    console.log('Fetching users from database...');
    
    // Fetch all auth users first to make sure we have complete data
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      throw authError;
    }

    // Get all profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, mfa_enrolled, mfa_required, created_at, is_admin');
    
    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      throw profileError;
    }

    console.log(`Found ${profiles.length} profiles`);
    console.log(`Found ${authUsers?.users?.length || 0} auth users`);
    
    // Map auth users to our UserData format
    const usersWithRoles = await Promise.all(
      (authUsers?.users || []).map(async (authUser) => {
        // Find matching profile
        const profile = profiles.find(p => p.id === authUser.id) || {
          id: authUser.id,
          full_name: authUser.user_metadata?.full_name || '',
          mfa_enrolled: false,
          mfa_required: false,
          created_at: authUser.created_at,
          is_admin: false
        };

        // Get user role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', authUser.id)
          .maybeSingle();
          
        return {
          ...profile,
          email: authUser.email || 'No email',
          role: (roleData?.role as UserRole) || (profile.is_admin ? 'admin' : 'user'),
        };
      })
    );

    console.log('Processed users with roles:', usersWithRoles);
    return usersWithRoles;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}
