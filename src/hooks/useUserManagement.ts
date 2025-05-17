
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { fetchAllUsers } from '@/services/userManagement/userFetchService';
import { updateUserRole } from '@/services/userManagement/roleServices';
import { 
  toggleMfaRequirement, 
  revokeMfaEnrollment 
} from '@/services/userService';
import { deleteUser } from '@/services/userManagement/userDeleteService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import type { UserData, UserRole } from '@/types/admin';

export function useUserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin, role } = useAuth();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();

  const canManageAllUsers = hasPermission('manage-users:all');
  const canManageSomeUsers = hasPermission('manage-users:lower');
  const canAssignRoles = hasPermission('assign-roles');

  useEffect(() => {
    // Redirect if not an admin or operator
    if (!isAdmin && !loading) {
      toast.error('Only administrators can access user management');
      navigate('/');
    } else {
      loadUsers();
    }
  }, [isAdmin, navigate]);

  async function loadUsers() {
    try {
      setLoading(true);
      setError(null);
      console.log("Attempting to load users from database...");
      
      const usersData = await fetchAllUsers();
      console.log("Loaded users:", usersData);
      setUsers(usersData);
    } catch (error: any) {
      console.error("Failed to load users:", error);
      setError(error?.message || 'Failed to load users. Please check your permissions.');
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateUserRole(userId: string, newRole: UserRole) {
    // Check permission to assign this role
    if (!canAssignRoles) {
      toast.error("You don't have permission to assign roles");
      return;
    }
    
    try {
      console.log(`[UserManagement] Updating user ${userId} to role ${newRole}`);
      await updateUserRole(userId, newRole, user?.id);
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
      
      toast.success(`User role updated to ${newRole}`);
    } catch (error: any) {
      console.error('[UserManagement] Error updating role:', error);
      toast.error(error?.message || 'Failed to update user role');
    }
  }

  async function handleToggleMfaRequirement(userId: string, required: boolean) {
    // Only allow admins and superadmins to modify MFA requirements
    if (!canManageAllUsers && !canManageSomeUsers) {
      toast.error("You don't have permission to modify MFA requirements");
      return;
    }
    
    try {
      await toggleMfaRequirement(userId, required);
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, mfa_required: required } : u
      ));
      toast.success(`MFA ${required ? 'required' : 'optional'} for user`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update MFA requirement');
    }
  }
  
  async function handleRevokeMfaEnrollment(userId: string) {
    // Only allow admins and superadmins to revoke MFA enrollment
    if (!canManageAllUsers && !canManageSomeUsers) {
      toast.error("You don't have permission to revoke MFA enrollment");
      return;
    }
    
    try {
      await revokeMfaEnrollment(userId);
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, mfa_enrolled: false } : u
      ));
      toast.success('MFA enrollment revoked. User will need to re-enroll.');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to revoke MFA enrollment');
    }
  }
  
  async function handleDeleteUser(userId: string) {
    // Check if the current user has permission to delete this user
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;
    
    const isSuperadmin = userToDelete.role === 'superadmin';
    const isAdmin = userToDelete.role === 'admin';
    
    // Only superadmins can delete superadmins or admins
    if ((isSuperadmin || isAdmin) && role !== 'superadmin') {
      toast.error("Only superadmins can delete admin users");
      return;
    }
    
    try {
      await deleteUser(userId);
      // Remove user from local state
      setUsers(users.filter(u => u.id !== userId));
      toast.success('User deleted successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete user');
    }
  }

  const handleCreateUserClick = () => {
    navigate('/admin/users/create');
  };

  return {
    users,
    loading,
    error,
    user,
    role,
    loadUsers,
    handleUpdateUserRole,
    handleToggleMfaRequirement,
    handleRevokeMfaEnrollment,
    handleDeleteUser,
    handleCreateUserClick
  };
}
