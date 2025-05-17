
import { UserData, UserRole } from '@/types/admin';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RoleSelector } from './RoleSelector';
import { MfaToggle } from './MfaToggle';
import { useAuth } from '@/contexts/auth';
import { canManageRole } from '@/utils/permissionUtils';
import { DeleteUserButton } from './DeleteUserButton';

interface UserTableProps {
  users: UserData[];
  currentUserId?: string;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  toggleMfaRequirement: (userId: string, required: boolean) => Promise<void>;
  revokeMfaEnrollment?: (userId: string) => Promise<void>;
  deleteUser?: (userId: string) => Promise<void>;
  loading: boolean;
}

export function UserTable({ 
  users, 
  currentUserId, 
  updateUserRole, 
  toggleMfaRequirement,
  revokeMfaEnrollment,
  deleteUser,
  loading 
}: UserTableProps) {
  const { role: currentUserRole } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="overflow-auto max-h-[60vh]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>MFA Status</TableHead>
            <TableHead>MFA Required</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            // Check if current user can manage this user's role
            const canManageThisUser = canManageRole(currentUserRole, user.role);
            
            return (
              <TableRow key={user.id}>
                <TableCell>{user.full_name || 'N/A'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <RoleSelector 
                    userId={user.id} 
                    currentRole={user.role} 
                    currentUserId={currentUserId}
                    onUpdateRole={updateUserRole} 
                  />
                </TableCell>
                <TableCell>
                  <span className={user.mfa_enrolled ? "text-green-500" : "text-amber-500"}>
                    {user.mfa_enrolled ? "Enrolled" : "Not Enrolled"}
                  </span>
                </TableCell>
                <TableCell>
                  <MfaToggle 
                    userId={user.id} 
                    isRequired={user.mfa_required}
                    isEnrolled={user.mfa_enrolled}
                    onToggle={toggleMfaRequirement}
                    onRevoke={revokeMfaEnrollment}
                    disabled={!canManageThisUser}
                  />
                </TableCell>
                <TableCell className="text-right">
                  {deleteUser && user.id !== currentUserId && canManageThisUser && (
                    <DeleteUserButton 
                      userId={user.id}
                      onDelete={deleteUser}
                    />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
