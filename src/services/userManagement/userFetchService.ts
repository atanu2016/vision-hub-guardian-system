
import { supabase } from '@/integrations/supabase/client';
import type { UserRole, UserData } from '@/types/admin';

/**
 * Fetches all users with their roles and profile data
 */
export async function fetchUsers(): Promise<UserData[]> {
  try {
    console.log('Fetching users from database...');
    
    // Get all profiles first - this should work better with RLS
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, mfa_enrolled, mfa_required, created_at, is_admin');
    
    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      throw profileError;
    }

    console.log(`Found ${profiles.length} profiles`);
    
    // For each profile, get roles and email
    const usersWithRoles = await Promise.all(
      profiles.map(async (profile) => {
        // Get user role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', profile.id)
          .maybeSingle();
          
        // Get user email from auth.users via admin API
        const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
        
        return {
          ...profile,
          email: userData?.user?.email || 'No email',
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
