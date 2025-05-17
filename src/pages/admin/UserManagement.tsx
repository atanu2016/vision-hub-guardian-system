
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { UserTable } from '@/components/admin/UserTable';
import { UserManagementHeader } from '@/components/admin/UserManagementHeader';
import { ErrorAlert } from '@/components/admin/ErrorAlert';
import { useUserManagement } from '@/hooks/useUserManagement';

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

  if (!role || (role !== 'admin' && role !== 'superadmin')) {
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
          <p>You need administrator privileges to access this page.</p>
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
          showCreateButton={role === 'superadmin'}
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
          revokeMfaEnrollment={handleRevokeMfaEnrollment}
          deleteUser={handleDeleteUser}
          loading={loading}
        />
      </CardContent>
    </Card>
  );
}
