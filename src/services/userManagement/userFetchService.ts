
import { supabase } from '@/integrations/supabase/client';
import type { UserRole, UserData } from '@/types/admin';

/**
 * Fetches all users with their roles and profile data
 */
export async function fetchUsers(): Promise<UserData[]> {
  try {
    // Get all auth users - only available to superadmin
    const { data: authUsers, error: authError } = await supabase
      .from('profiles')
      .select('id, full_name, mfa_enrolled, mfa_required, created_at');
    
    if (authError) throw authError;

    // For each user, get roles
    const usersWithRoles = await Promise.all(
      authUsers.map(async (user) => {
        // Get user role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();
          
        // Get user email - we can't query the auth.users table directly from client
        // so we use admin api, which requires appropriate permissions
        const { data: userData } = await supabase.auth.admin.getUserById(user.id);
        
        return {
          ...user,
          email: userData?.user?.email || 'No email',
          role: (roleData?.role as UserRole) || 'user',
        };
      })
    );

    return usersWithRoles;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}
