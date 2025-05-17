
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleSelector } from "./RoleSelector";
import { MfaToggle } from "./MfaToggle";
import { DeleteUserButton } from "./DeleteUserButton";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { UserData, UserRole } from "@/types/admin";
import { usePermissions } from "@/hooks/usePermissions";

interface UserTableProps {
  users: UserData[];
  loading: boolean;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  toggleMfaRequirement: (userId: string, required: boolean) => Promise<void>;
  revokeMfaEnrollment: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  onAssignCameras?: (userId: string, userName: string) => void;
}

export function UserTable({ 
  users, 
  loading, 
  updateUserRole, 
  toggleMfaRequirement, 
  revokeMfaEnrollment, 
  deleteUser,
  onAssignCameras 
}: UserTableProps) {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const canAssignCameras = hasPermission('assign-cameras');

  if (loading) {
    return <TableLoadingSkeleton />;
  }

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
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((userData) => (
              <TableRow key={userData.id}>
                <TableCell className="font-medium">{userData.email}</TableCell>
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
                <TableCell className="text-right space-x-2">
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
