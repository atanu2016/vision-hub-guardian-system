import { supabase } from '@/integrations/supabase/client';
import type { UserRole, UserData } from '@/types/admin';
import { toast } from 'sonner';

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
          
        // Get user email
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

export async function updateUserRole(userId: string, newRole: UserRole, currentUserId?: string): Promise<void> {
  try {
    // Don't allow changing your own role if you're a superadmin
    if (userId === currentUserId && newRole !== 'superadmin') {
      toast.error("You cannot downgrade your own superadmin role");
      return;
    }

    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    let error;
    
    if (existingRole) {
      // Update existing role
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
        
      error = updateError;
    } else {
      // Insert new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });
        
      error = insertError;
    }

    if (error) throw error;
    
    toast.success(`User role updated to ${newRole}`);
  } catch (error) {
    console.error('Error updating user role:', error);
    toast.error('Failed to update user role');
    throw error;
  }
}

export async function toggleMfaRequirement(userId: string, required: boolean): Promise<void> {
  try {
    // First update the profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ mfa_required: required })
      .eq('id', userId);
      
    if (profileError) throw profileError;
    
    // If MFA is being disabled, also reset MFA enrollment status if needed
    if (!required) {
      // Check if the user has MFA enrolled
      const { data: userData } = await supabase
        .from('profiles')
        .select('mfa_enrolled')
        .eq('id', userId)
        .single();
        
      if (userData && userData.mfa_enrolled) {
        // Reset MFA enrollment status
        const { error: resetError } = await supabase
          .from('profiles')
          .update({ mfa_enrolled: false })
          .eq('id', userId);
          
        if (resetError) throw resetError;
      }
    }
    
    toast.success(`MFA requirement ${required ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error('Error updating MFA requirement:', error);
    toast.error('Failed to update MFA requirement');
    throw error;
  }
}

// Updated function to check admin access for migration tools
export async function checkMigrationAccess(userId: string): Promise<boolean> {
  try {
    console.log("Checking migration access for userId:", userId);
    
    // Direct query to check email for admin@home.local
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userData?.user && userData.user.email === 'admin@home.local') {
      console.log("User is admin@home.local, granting access");
      return true;
    }
    
    if (userError) {
      console.error("Error checking user email:", userError);
    }
    
    // Check if the user is an admin based on profile flag
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error('Error checking profile admin status:', profileError);
    }
    
    // If user has admin flag in profile, grant access
    if (profileData && profileData.is_admin === true) {
      console.log("User has is_admin=true, granting access");
      return true;
    }
    
    // Also check for admin or superadmin role in user_roles table
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (roleError) {
      console.error('Error checking user role:', roleError);
    }
    
    // Grant access if user has admin or superadmin role
    const hasAdminRole = roleData && (roleData.role === 'admin' || roleData.role === 'superadmin');
    console.log("User has admin role:", hasAdminRole);
    return hasAdminRole || false;
  } catch (error) {
    console.error('Error checking migration access:', error);
    return false;
  }
}

// Updated helper function to create or ensure a user is admin
export async function ensureUserIsAdmin(userId: string): Promise<boolean> {
  console.log("Ensuring user is admin:", userId);
  try {
    // First update profile to have admin flag
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', userId);
    
    if (profileError) {
      console.error('Error updating profile admin status:', profileError);
      
      // If update failed, try insert
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      if (userData?.user) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ 
            id: userId,
            full_name: userData.user.email?.split('@')[0] || 'Administrator',
            is_admin: true,
            mfa_required: false
          });
          
        if (insertError) {
          console.error('Error inserting profile:', insertError);
          return false;
        }
      }
    }
    
    // Then ensure they have a superadmin role
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({ 
        user_id: userId, 
        role: 'superadmin',
        updated_at: new Date().toISOString()
      });
    
    if (roleError) {
      console.error('Error updating user role:', roleError);
      return false;
    }
    
    console.log("Successfully granted admin privileges to user:", userId);
    return true;
  } catch (error) {
    console.error('Error ensuring user is admin:', error);
    return false;
  }
}
