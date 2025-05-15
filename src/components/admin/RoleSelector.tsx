
import { useState } from 'react';
import { Shield, ShieldCheck, ShieldX, User } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UserRole } from '@/types/admin';

interface RoleSelectorProps {
  userId: string;
  currentRole: UserRole;
  currentUserId: string | undefined;
  onUpdateRole: (userId: string, newRole: UserRole) => Promise<void>;
}

export function RoleSelector({ userId, currentRole, currentUserId, onUpdateRole }: RoleSelectorProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRoleChange = async (value: string) => {
    setIsUpdating(true);
    try {
      await onUpdateRole(userId, value as UserRole);
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
  const disabled = userId === currentUserId && currentRole === 'superadmin';

  return (
    <div className="flex items-center gap-2">
      {getRoleIcon(currentRole)}
      <Select
        defaultValue={currentRole}
        onValueChange={handleRoleChange}
        disabled={isUpdating || disabled}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="superadmin">Superadmin</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="operator">Operator</SelectItem>
          <SelectItem value="user">User</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
