
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

// New function to check admin access for migration tools
export async function checkMigrationAccess(userId: string): Promise<boolean> {
  try {
    // Check if the user is an admin or superadmin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
      
    return roleData && (roleData.role === 'admin' || roleData.role === 'superadmin');
  } catch (error) {
    console.error('Error checking migration access:', error);
    return false;
  }
}
