
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { UserTable } from '@/components/admin/UserTable';
import { fetchUsers } from '@/services/userManagement/userFetchService';
import { updateUserRole, toggleMfaRequirement, deleteUser } from '@/services/userService';
import type { UserData, UserRole } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const { isSuperAdmin, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      console.log("Attempting to load users...");
      const usersData = await fetchUsers();
      console.log("Loaded users:", usersData);
      setUsers(usersData);
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateUserRole(userId: string, newRole: UserRole) {
    try {
      await updateUserRole(userId, newRole, user?.id);
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
    } catch (error) {
      // Error is already handled in the service
    }
  }

  async function handleToggleMfaRequirement(userId: string, required: boolean) {
    try {
      await toggleMfaRequirement(userId, required);
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, mfa_required: required } : u
      ));
    } catch (error) {
      // Error is already handled in the service
    }
  }
  
  async function handleDeleteUser(userId: string) {
    try {
      await deleteUser(userId);
      // Remove user from local state
      setUsers(users.filter(u => u.id !== userId));
      toast.success('User deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
  }

  const handleCreateUserClick = () => {
    navigate('/admin/users/create');
  };

  if (!isSuperAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            You need superadmin privileges to access this page.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <span>User Management</span>
          </CardTitle>
          <CardDescription>
            Manage user roles and security settings
          </CardDescription>
        </div>
        <Button 
          onClick={handleCreateUserClick}
          size="sm"
          className="flex items-center gap-2 bg-vision-blue hover:bg-vision-blue-600"
        >
          <UserPlus className="h-4 w-4" />
          Create User
        </Button>
      </CardHeader>
      <CardContent>
        <UserTable 
          users={users}
          currentUserId={user?.id}
          updateUserRole={handleUpdateUserRole}
          toggleMfaRequirement={handleToggleMfaRequirement}
          deleteUser={handleDeleteUser}
          loading={loading}
        />
      </CardContent>
    </Card>
  );
}
