
import { useState, useEffect } from 'react';
import { Shield, ShieldCheck, ShieldX, User, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UserRole } from '@/types/admin';
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
  const { role: currentUserRole } = useAuth();
  const { hasPermission } = usePermissions();

  // Update local state when prop changes
  useEffect(() => {
    setSelectedRole(currentRole);
  }, [currentRole]);

  // Check if user can assign roles (superadmin only)
  const canAssignRoles = hasPermission('assign-roles');

  const handleRoleChange = async (value: string) => {
    setIsUpdating(true);
    try {
      setSelectedRole(value as UserRole);
      console.log(`[RoleSelector] Changing role to: ${value} for user: ${userId}`);
      
      await onUpdateRole(userId, value as UserRole);
      toast.success(`Role updated to ${value}`);
    } catch (error: any) {
      console.error('[RoleSelector] Error updating role:', error);
      toast.error(error.message || 'Failed to update role');
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
      case 'operator': 
        return <ShieldX className="h-5 w-5 text-blue-500" />;
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
    <div className="flex items-center gap-2">
      {getRoleIcon(selectedRole)}
      <Select
        value={selectedRole}
        onValueChange={handleRoleChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Role">
            {isUpdating ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
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
          <SelectItem value="operator" disabled={!canManageUser}>Operator</SelectItem>
          <SelectItem value="user" disabled={!canManageUser}>User</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
