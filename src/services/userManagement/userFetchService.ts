
import { supabase } from '@/integrations/supabase/client';
import type { UserRole, UserData } from '@/types/admin';

/**
 * Fetches all users with their roles and profile data
 */
export async function fetchUsers(): Promise<UserData[]> {
  try {
    console.log('Fetching users from database...');
    
    // First get all profiles to avoid recursive policy issues
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, mfa_enrolled, mfa_required, created_at, is_admin');
    
    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      throw profileError;
    }

    // Then get emails from auth.users using admin functions 
    const usersWithData = await Promise.all(
      profiles.map(async (profile) => {
        // Get user email using the admin API
        const { data: userData, error: authError } = await supabase.auth.admin.getUserById(profile.id);
        
        if (authError) {
          console.error(`Error fetching auth data for user ${profile.id}:`, authError);
        }

        // Get role information
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', profile.id)
          .maybeSingle();

        // Determine role from either role table or is_admin flag
        const role = roleData?.role || (profile.is_admin ? 'admin' : 'user');

        return {
          ...profile,
          email: userData?.user?.email || 'Unknown email',
          role: role as UserRole,
        };
      })
    );

    console.log('Processed users with roles:', usersWithData);
    return usersWithData;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}
