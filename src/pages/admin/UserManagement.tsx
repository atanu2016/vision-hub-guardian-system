
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { UserTable } from '@/components/admin/UserTable';
import { UserManagementHeader } from '@/components/admin/UserManagementHeader';
import { ErrorAlert } from '@/components/admin/ErrorAlert';
import { useUserManagement } from '@/hooks/useUserManagement';
import { usePermissions } from '@/hooks/usePermissions';

export default function UserManagement() {
  const {
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
  } = useUserManagement();
  
  const { hasPermission } = usePermissions();
  
  // Check if user has appropriate permissions
  const canCreateUsers = hasPermission('manage-users:all');
  const canManageMfa = hasPermission('manage-users:lower');

  // If user doesn't have minimum required permissions, show access denied
  if (!hasPermission('manage-users:lower')) {
    return (
      <Card>
        <CardHeader>
          <UserManagementHeader 
            onRefresh={loadUsers}
            onCreateUser={handleCreateUserClick}
            loading={loading}
            showCreateButton={false}
          />
        </CardHeader>
        <CardContent>
          <p>You need administrative privileges to access this page.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <UserManagementHeader 
          onRefresh={loadUsers}
          onCreateUser={handleCreateUserClick}
          loading={loading}
          showCreateButton={canCreateUsers}
        />
      </CardHeader>

      <CardContent>
        {error && (
          <ErrorAlert error={error} onRetry={loadUsers} />
        )}

        <UserTable 
          users={users}
          currentUserId={user?.id}
          updateUserRole={handleUpdateUserRole}
          toggleMfaRequirement={handleToggleMfaRequirement}
          revokeMfaEnrollment={canManageMfa ? handleRevokeMfaEnrollment : undefined}
          deleteUser={canManageMfa ? handleDeleteUser : undefined}
          loading={loading}
        />
      </CardContent>
    </Card>
  );
}
