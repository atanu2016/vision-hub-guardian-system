
import { UserData, UserRole } from '@/types/admin';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RoleSelector } from './RoleSelector';
import { MfaToggle } from './MfaToggle';
import { Button } from '@/components/ui/button';
import { UserMinus } from 'lucide-react';
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface UserTableProps {
  users: UserData[];
  currentUserId?: string;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  toggleMfaRequirement: (userId: string, required: boolean) => Promise<void>;
  deleteUser?: (userId: string) => Promise<void>;
  loading: boolean;
}

export function UserTable({ 
  users, 
  currentUserId, 
  updateUserRole, 
  toggleMfaRequirement,
  deleteUser,
  loading 
}: UserTableProps) {
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const handleDeleteClick = (userId: string) => {
    setDeletingUserId(userId);
  };

  const handleConfirmDelete = async () => {
    if (deletingUserId && deleteUser) {
      await deleteUser(deletingUserId);
      setDeletingUserId(null);
    }
  };

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
          {users.map((user) => (
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
                  onToggle={toggleMfaRequirement} 
                />
              </TableCell>
              <TableCell className="text-right">
                {deleteUser && user.id !== currentUserId && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteClick(user.id)}
                      >
                        <UserMinus className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the user 
                          account and remove their data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete User
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
