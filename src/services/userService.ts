
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
    const { error } = await supabase
      .from('profiles')
      .update({ mfa_required: required })
      .eq('id', userId);
      
    if (error) throw error;
    
    toast.success(`MFA requirement ${required ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error('Error updating MFA requirement:', error);
    toast.error('Failed to update MFA requirement');
    throw error;
  }
}
