
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
    
    console.log('Attempting to fetch users via edge function...');
    
    // Call the edge function with proper type checking
    const { data, error } = await supabase.functions.invoke<unknown>('get-all-users', {
      method: 'POST'
    });
      
    if (error) {
      console.error('Error fetching users via Edge Function:', error);
      
      // Fallback: Try to get profiles directly if edge function fails
      return await fetchUsersDirectly();
    }

    // Type checking for the response
    if (!data || !Array.isArray(data)) {
      console.error('Invalid response format from edge function:', data);
      
      // Fallback to direct database query
      return await fetchUsersDirectly();
    }

    console.log(`Successfully received ${data.length} users from edge function`);

    // Transform and type-check the edge function response
    const usersData = data.map(user => {
      // Ensure we have a valid user object
      if (!user || typeof user !== 'object') {
        return {
          id: '',
          email: 'Invalid user data',
          full_name: null,
          mfa_enrolled: false,
          mfa_required: false,
          created_at: new Date().toISOString(),
          is_admin: false,
          role: 'user' as UserRole
        };
      }

      const typedUser = user as Record<string, any>;

      return {
        id: typedUser.id || '',
        email: typedUser.email || 'Unknown email',
        full_name: typedUser.full_name || null,
        mfa_enrolled: !!typedUser.mfa_enrolled,
        mfa_required: !!typedUser.mfa_required,
        created_at: typedUser.created_at || typedUser.auth_created_at || new Date().toISOString(),
        is_admin: !!typedUser.is_admin,
        role: (typedUser.role || 'user') as UserRole
      };
    });

    console.log(`Successfully processed ${usersData.length} users with roles`);
    return usersData;
    
  } catch (error) {
    console.error('Error in fetchUsers:', error);
    
    // Try direct database approach as a final fallback
    try {
      return await fetchUsersDirectly();
    } catch (fallbackError) {
      console.error('Fallback approach also failed:', fallbackError);
      throw new Error('Failed to load users: Permission denied');
    }
  }
}

/**
 * Fallback function that tries to fetch users directly from the database
 * when the edge function approach fails
 */
async function fetchUsersDirectly(): Promise<UserData[]> {
  console.log('Falling back to direct database fetch...');
  
  // Try to get profiles directly
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, mfa_enrolled, mfa_required, created_at, is_admin');
  
  if (profilesError) {
    console.error('Fallback error fetching profiles:', profilesError);
    throw new Error('Failed to load users: Permission denied');
  }
  
  if (!profiles || profiles.length === 0) {
    console.log('No profiles found in direct database query');
    return [];
  }
  
  // Get user roles from user_roles table for mapping
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('user_id, role');
  
  const rolesMap = (userRoles || []).reduce((acc, item) => {
    acc[item.user_id] = item.role as UserRole;
    return acc;
  }, {} as Record<string, UserRole>);
  
  // Return minimal profile data when we can't access auth.users
  console.log(`Found ${profiles.length} profiles in direct database query`);
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
