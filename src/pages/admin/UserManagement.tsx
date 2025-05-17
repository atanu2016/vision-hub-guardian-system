
import { UserTable } from "@/components/admin/UserTable";
import { UserManagementHeader } from "@/components/admin/UserManagementHeader";
import { ErrorAlert } from "@/components/admin/ErrorAlert";
import { useState } from "react";
import { useUserManagement } from "@/hooks/useUserManagement";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/auth";
import { usePermissions } from "@/hooks/usePermissions";
import { Camera } from "lucide-react";
import CameraAssignmentModal from "@/components/admin/CameraAssignmentModal";
import { Button } from "@/components/ui/button";

const UserManagement = () => {
  const { isSuperAdmin } = useAuth();
  const { hasPermission } = usePermissions();
  const { 
    users, 
    loading, 
    error, 
    loadUsers, 
    handleUpdateUserRole, 
    handleToggleMfaRequirement, 
    handleRevokeMfaEnrollment,
    handleDeleteUser,
    handleCreateUserClick
  } = useUserManagement();
  
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [showCameraAssignment, setShowCameraAssignment] = useState(false);

  const handleCameraAssignmentClick = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setShowCameraAssignment(true);
  };

  const handleCameraAssignmentClose = () => {
    setShowCameraAssignment(false);
    setSelectedUserId(null);
    setSelectedUserName('');
  };

  return (
    <AppLayout>
      <UserManagementHeader 
        onRefresh={loadUsers} 
        onCreateUser={handleCreateUserClick}
        loading={loading}
        showCreateButton={isSuperAdmin}
      />

      {error && <ErrorAlert error={error} onRetry={loadUsers} />}

      <UserTable 
        users={users} 
        loading={loading} 
        updateUserRole={handleUpdateUserRole}
        toggleMfaRequirement={handleToggleMfaRequirement}
        revokeMfaEnrollment={handleRevokeMfaEnrollment}
        deleteUser={handleDeleteUser}
      />

      {selectedUserId && (
        <CameraAssignmentModal
          isOpen={showCameraAssignment}
          userId={selectedUserId}
          userName={selectedUserName}
          onClose={handleCameraAssignmentClose}
        />
      )}

      {/* Add assign cameras button outside of the table component */}
      {hasPermission('assign-cameras') && (
        <div className="flex justify-end mt-4">
          <Button 
            variant="outline" 
            onClick={() => setShowCameraAssignment(true)}
            className="ml-2"
          >
            <Camera className="h-4 w-4 mr-1" />
            Assign Cameras to Users
          </Button>
        </div>
      )}
    </AppLayout>
  );
};

export default UserManagement;
