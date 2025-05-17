
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, UserPlus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { UserTable } from '@/components/admin/UserTable';
import { fetchUsers } from '@/services/userManagement/userFetchService';
import { updateUserRole, toggleMfaRequirement, deleteUser } from '@/services/userService';
import type { UserData, UserRole } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSuperAdmin, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not an admin
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
      
      const usersData = await fetchUsers();
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
    try {
      await updateUserRole(userId, newRole, user?.id);
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
      toast.success(`User role updated to ${newRole}`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update user role');
    }
  }

  async function handleToggleMfaRequirement(userId: string, required: boolean) {
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
  
  async function handleDeleteUser(userId: string) {
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

  const handleRetry = () => {
    loadUsers();
  };

  if (!isAdmin && !isSuperAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            You need administrator privileges to access this page.
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
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={handleRetry}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={handleCreateUserClick}
            size="sm"
            className="flex items-center gap-2 bg-vision-blue hover:bg-vision-blue-600"
          >
            <UserPlus className="h-4 w-4" />
            Create User
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error loading users</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={handleRetry} className="ml-2">
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

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
