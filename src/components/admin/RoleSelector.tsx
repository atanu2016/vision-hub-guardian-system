
import { useState, useEffect } from 'react';
import { Shield, ShieldCheck, User, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UserRole } from '@/contexts/auth/types';
import { useAuth } from '@/contexts/auth';
import { canManageRole } from '@/utils/permissionUtils';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';

interface RoleSelectorProps {
  userId: string;
  currentRole: UserRole;
  currentUserId: string | undefined;
  onUpdateRole: (userId: string, newRole: UserRole) => Promise<void>;
}

export function RoleSelector({ userId, currentRole, currentUserId, onUpdateRole }: RoleSelectorProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [error, setError] = useState<string | null>(null);
  const { role: currentUserRole } = useAuth();
  const { hasPermission } = usePermissions();

  // Update local state when prop changes
  useEffect(() => {
    setSelectedRole(currentRole);
    console.log(`[RoleSelector] Current role for user ${userId} is ${currentRole}`);
  }, [currentRole, userId]);

  // Check if user can assign roles (superadmin or admin)
  const canAssignRoles = hasPermission('assign-roles');

  const handleRoleChange = async (value: string) => {
    if (value === selectedRole) return; // No change
    
    setIsUpdating(true);
    setError(null);
    
    try {
      const newRole = value as UserRole;
      console.log(`[RoleSelector] Changing role to: ${newRole} for user: ${userId}`);
      
      // Temporarily update UI optimistically
      setSelectedRole(newRole);
      
      // Allow a bit more time for the database operation
      const updatePromise = onUpdateRole(userId, newRole);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Role update timed out. Please try again.')), 10000)
      );
      
      await Promise.race([updatePromise, timeoutPromise]);
      
      // Show feedback with fixed role
      toast.success(`Role updated to ${newRole}`, {
        description: "The user's role was successfully updated in the database."
      });
      
      // Force component refresh
      setTimeout(() => {
        console.log(`[RoleSelector] Confirming role change to: ${newRole}`);  
      }, 1000);
      
    } catch (error: any) {
      console.error('[RoleSelector] Error updating role:', error);
      setError(error.message || 'Failed to update role');
      
      toast.error('Failed to update role', {
        description: error.message || "There was an error updating the user's role."
      });
      
      // Revert selection on error
      setSelectedRole(currentRole);
    } finally {
      setIsUpdating(false);
    }
  };

  function getRoleIcon(role: UserRole) {
    switch (role) {
      case 'superadmin': 
        return <Shield className="h-5 w-5 text-red-500" />;
      case 'admin': 
        return <ShieldCheck className="h-5 w-5 text-amber-500" />;
      case 'observer': 
        return <Eye className="h-5 w-5 text-blue-500" />;
      default: 
        return <User className="h-5 w-5 text-gray-500" />;
    }
  }

  // Don't allow changing your own role except for superadmin
  const isSelf = userId === currentUserId;
  const canManageUser = canManageRole(currentUserRole, currentRole);

  // Disable if:
  // 1. User is trying to change their own role (except superadmin)
  // 2. User doesn't have permission to manage this role
  // 3. Currently updating
  const disabled = (isSelf && currentRole !== 'superadmin') || !canManageUser || isUpdating || !canAssignRoles;

  return (
    <div className="flex items-center gap-2 relative">
      {getRoleIcon(selectedRole)}
      <Select
        value={selectedRole}
        onValueChange={handleRoleChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-40 relative">
          <SelectValue placeholder="Role">
            {isUpdating ? (
              <div className="flex items-center">
                <span>Updating...</span>
              </div>
            ) : (
              selectedRole
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="superadmin" disabled={currentUserRole !== 'superadmin'}>Superadmin</SelectItem>
          <SelectItem value="admin" disabled={currentUserRole !== 'superadmin'}>Admin</SelectItem>
          <SelectItem value="observer" disabled={!canManageUser}>Observer</SelectItem>
          <SelectItem value="user" disabled={!canManageUser}>User</SelectItem>
        </SelectContent>
      </Select>
      
      {error && (
        <div className="text-red-500 text-xs mt-1 absolute -bottom-5 left-0 right-0">
          {error}
        </div>
      )}
    </div>
  );
}
