
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleSelector } from "./RoleSelector";
import { MfaToggle } from "./MfaToggle";
import { DeleteUserButton } from "./DeleteUserButton";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Camera, Key } from "lucide-react";
import { UserData, UserRole } from "@/types/admin";
import { usePermissions } from "@/hooks/usePermissions";
import { toast } from "sonner";

interface UserTableProps {
  users: UserData[];
  loading: boolean;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  toggleMfaRequirement: (userId: string, required: boolean) => Promise<void>;
  revokeMfaEnrollment: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  onAssignCameras?: (userId: string, userName: string) => void;
  onResetPassword?: (userId: string, userEmail: string) => Promise<void>;
}

export function UserTable({ 
  users, 
  loading, 
  updateUserRole, 
  toggleMfaRequirement, 
  revokeMfaEnrollment, 
  deleteUser,
  onAssignCameras,
  onResetPassword
}: UserTableProps) {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const canAssignCameras = hasPermission('assign-cameras');
  const canManageUsers = hasPermission('manage-users:lower');

  const handleResetPassword = async (userId: string, userEmail: string) => {
    if (onResetPassword) {
      await onResetPassword(userId, userEmail);
    } else {
      toast.info(`Password reset functionality not implemented for ${userEmail}`);
    }
  };

  if (loading) {
    return <TableLoadingSkeleton />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[180px]">Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>MFA Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((userData) => (
              <TableRow key={userData.id}>
                <TableCell className="font-medium truncate max-w-[180px]" title={userData.email || ''}>
                  {userData.email || 'N/A'}
                </TableCell>
                <TableCell>{userData.full_name || 'N/A'}</TableCell>
                <TableCell>
                  <RoleSelector 
                    userId={userData.id} 
                    currentRole={userData.role}
                    currentUserId={user?.id}
                    onUpdateRole={updateUserRole}
                  />
                </TableCell>
                <TableCell>
                  <MfaToggle 
                    userId={userData.id}
                    mfaRequired={userData.mfa_required}
                    mfaEnrolled={userData.mfa_enrolled}
                    onToggleMfaRequirement={toggleMfaRequirement}
                    onRevokeMfaEnrollment={revokeMfaEnrollment}
                  />
                </TableCell>
                <TableCell className="text-right flex justify-end items-center space-x-1">
                  {canManageUsers && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleResetPassword(userData.id, userData.email || '')}
                      className="h-8 w-8"
                      title="Reset Password"
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                  )}
                  {canAssignCameras && onAssignCameras && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onAssignCameras(userData.id, userData.email || 'User')}
                      className="h-8 w-8"
                      title="Assign Cameras"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                  <DeleteUserButton 
                    userId={userData.id}
                    userEmail={userData.email || ''}
                    onDelete={deleteUser}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function TableLoadingSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>MFA Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-4 w-[70px] ml-auto" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
