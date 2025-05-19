
import { supabase } from '@/integrations/supabase/client';
import type { UserRole, UserData } from '@/types/admin';
import { toast } from 'sonner';

/**
 * Fetches all users with their roles and profile data
 * Using the bypass RLS function to avoid recursion errors
 */
export async function fetchAllUsers(): Promise<UserData[]> {
  try {
    console.log('Fetching users from database using bypass function...');
    
    // First check if the current user has auth session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No active session found');
      throw new Error('Authentication required');
    }
    
    // Use the new bypass function that avoids RLS recursion completely
    const { data, error } = await supabase.rpc('get_all_users_bypass_rls');
      
    if (error) {
      console.error('Error fetching users via bypass function:', error);
      // Fallback to the view if the function fails
      return await fetchUsersFromView();
    }

    // Type checking for the response
    if (!data || !Array.isArray(data)) {
      console.error('Invalid response format from bypass function:', data);
      // Fallback to the view
      return await fetchUsersFromView();
    }

    console.log(`Successfully received ${data.length} users from bypass function`);

    // Transform and type-check the function response
    const usersData = data.map(user => {
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
      return await fetchUsersFromView();
    } catch (fallbackError) {
      console.error('All fallback approaches failed:', fallbackError);
      throw new Error('Failed to load users: Permission denied');
    }
  }
}

/**
 * Fallback function that tries to fetch users from the view we created
 * This view bypasses RLS and should be accessible
 */
async function fetchUsersFromView(): Promise<UserData[]> {
  console.log('Falling back to view-based fetch...');
  
  try {
    // Get data from our custom view that bypasses RLS
    const { data: viewUsers, error: viewError } = await supabase
      .from('vw_all_users')
      .select('*');
    
    if (viewError) {
      console.error('View-based fetch failed:', viewError);
      throw viewError;
    }
    
    if (!viewUsers || viewUsers.length === 0) {
      console.log('No users found in view');
      return [];
    }
    
    console.log(`Found ${viewUsers.length} users in view`);
    
    // Transform to required format
    return viewUsers.map(user => ({
      id: user.id,
      email: user.email || user.id,
      full_name: user.full_name || null,
      mfa_enrolled: user.mfa_enrolled || false,
      mfa_required: user.mfa_required || false,
      created_at: user.created_at || new Date().toISOString(),
      is_admin: user.is_admin || false,
      role: user.role as UserRole
    }));
  } catch (error) {
    console.error('Error in fetchUsersFromView:', error);
    throw new Error('Failed to load users: Permission denied');
  }
}
