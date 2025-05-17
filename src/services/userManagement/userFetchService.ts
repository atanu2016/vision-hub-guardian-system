
import { supabase } from '@/integrations/supabase/client';
import type { UserRole, UserData } from '@/types/admin';
import { toast } from 'sonner';

/**
 * Fetches all users with their roles and profile data
 */
export async function fetchAllUsers(): Promise<UserData[]> {
  try {
    console.log('Fetching users from database...');
    
    // First check if the current user has auth session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }
    
    console.log('Attempting to fetch users via edge function...');
    
    // Call the edge function with proper type checking
    const { data, error } = await supabase.functions.invoke('get-all-users', {
      method: 'POST',
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
        email: typedUser.email || typedUser.id || 'Unknown email',
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
    console.error('Error in fetchAllUsers:', error);
    
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
  
  try {
    // First check if current user is admin via function call
    const { data: isAdmin, error: adminCheckError } = await supabase
      .rpc('check_admin_status');
      
    if (adminCheckError || !isAdmin) {
      console.error('User is not an admin or error checking status:', adminCheckError);
      throw new Error('Permission denied: Admin access required');
    }
    
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
    
    // Get emails - this is a best effort attempt
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    let emailsMap: Record<string, string> = {};
    
    if (authError) {
      console.error('Error listing users:', authError);
    } else if (authData && 'users' in authData && Array.isArray(authData.users)) {
      console.log(`Found ${authData.users.length} users in auth table`);
      // Map user emails by ID
      authData.users.forEach(user => {
        if (user && typeof user.id === 'string' && typeof user.email === 'string') {
          emailsMap[user.id] = user.email;
        }
      });
    }
    
    // Return profile data with available email information
    console.log(`Found ${profiles.length} profiles in direct database query`);
    return profiles.map(profile => {
      const role = rolesMap[profile.id] || (profile.is_admin ? 'admin' : 'user');
      return {
        id: profile.id,
        email: emailsMap[profile.id] || profile.id, // Use ID as fallback
        full_name: profile.full_name || null,
        mfa_enrolled: profile.mfa_enrolled || false,
        mfa_required: profile.mfa_required || false,
        created_at: profile.created_at || new Date().toISOString(),
        is_admin: profile.is_admin || false,
        role: role
      };
    });
  } catch (error) {
    console.error('Error in fetchUsersDirectly:', error);
    throw new Error('Failed to load users: Permission denied');
  }
}
