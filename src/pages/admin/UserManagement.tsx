
import { useState } from "react";
import { UserTable } from "@/components/admin/UserTable";
import { UserManagementHeader } from "@/components/admin/UserManagementHeader";
import { ErrorAlert } from "@/components/admin/ErrorAlert";
import { useUserManagement } from "@/hooks/useUserManagement";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/auth";
import { UserData } from "@/types/admin";
import { toast } from "sonner";
import CameraAssignmentModal from "@/components/admin/CameraAssignmentModal";
import { UserSelectorModal } from "@/components/admin/UserSelectorModal";
import { UserActions } from "@/components/admin/UserManagement/UserActions";
import { EmailResetDialog } from "@/components/admin/PasswordReset/EmailResetDialog";
import { AdminPasswordResetDialog } from "@/components/admin/PasswordReset/AdminPasswordResetDialog";
import { adminResetUserPassword, resetPassword } from "@/contexts/auth/authActions";

const UserManagement = () => {
  const { isSuperAdmin } = useAuth();
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
  
  // States for camera assignment functionality
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [showCameraAssignment, setShowCameraAssignment] = useState(false);
  const [showUserSelector, setShowUserSelector] = useState(false);
  
  // States for password reset functionality
  const [showEmailResetDialog, setShowEmailResetDialog] = useState(false);
  const [passwordResetEmail, setPasswordResetEmail] = useState('');
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  
  // State for admin direct password reset
  const [showAdminPasswordResetDialog, setShowAdminPasswordResetDialog] = useState(false);
  const [newUserPassword, setNewUserPassword] = useState('');
  const [adminPasswordResetLoading, setAdminPasswordResetLoading] = useState(false);

  // Camera assignment handlers
  const handleCameraAssignmentClick = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setShowCameraAssignment(true);
    setShowUserSelector(false);
  };

  const handleCameraAssignmentClose = () => {
    setShowCameraAssignment(false);
    setSelectedUserId(null);
    setSelectedUserName('');
  };

  const handleCameraAssignmentButtonClick = () => {
    setShowUserSelector(true);
  };

  const handleUserSelect = (user: UserData) => {
    setSelectedUserId(user.id);
    setSelectedUserName(user.email || "Selected User");
    setShowCameraAssignment(true);
    setShowUserSelector(false);
  };

  // Password reset handlers
  const handleResetPassword = async (userId: string, userEmail: string) => {
    setSelectedUserId(userId);
    
    // Check if we have a valid email address for sending reset email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (userEmail && emailRegex.test(userEmail)) {
      // If valid email, use email reset flow
      setPasswordResetEmail(userEmail);
      setShowEmailResetDialog(true);
    } else {
      // If no valid email, use admin direct password reset
      setShowAdminPasswordResetDialog(true);
      setNewUserPassword('');
    }
  };

  const handleSendPasswordResetEmail = async () => {
    if (!passwordResetEmail) {
      toast.error("Email address is required");
      return;
    }

    setPasswordResetLoading(true);
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(passwordResetEmail)) {
        toast.error("Please enter a valid email address (e.g. user@example.com)");
        setPasswordResetLoading(false);
        return;
      }
      
      await resetPassword(passwordResetEmail);
      setPasswordResetLoading(false);
      setShowEmailResetDialog(false);
    } catch (error) {
      setPasswordResetLoading(false);
    }
  };
  
  const handleAdminPasswordReset = async () => {
    if (!selectedUserId) {
      toast.error("No user selected");
      return;
    }
    
    if (!newUserPassword || newUserPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    setAdminPasswordResetLoading(true);
    try {
      await adminResetUserPassword(selectedUserId, newUserPassword);
      setAdminPasswordResetLoading(false);
      setShowAdminPasswordResetDialog(false);
      setNewUserPassword('');
    } catch (error) {
      setAdminPasswordResetLoading(false);
    }
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
        onAssignCameras={handleCameraAssignmentClick}
        onResetPassword={handleResetPassword}
      />

      {/* Camera Assignment Modal */}
      {selectedUserId && (
        <CameraAssignmentModal
          isOpen={showCameraAssignment}
          userId={selectedUserId}
          userName={selectedUserName}
          onClose={handleCameraAssignmentClose}
        />
      )}

      {/* User Selector Modal */}
      <UserSelectorModal
        isOpen={showUserSelector}
        onClose={() => setShowUserSelector(false)}
        onUserSelect={handleUserSelect}
        users={users}
        loading={loading}
      />

      {/* Password Reset Email Dialog */}
      <EmailResetDialog
        isOpen={showEmailResetDialog}
        onOpenChange={setShowEmailResetDialog}
        email={passwordResetEmail}
        onEmailChange={setPasswordResetEmail}
        onSendReset={handleSendPasswordResetEmail}
        isLoading={passwordResetLoading}
      />
      
      {/* Admin Direct Password Reset Dialog */}
      <AdminPasswordResetDialog
        isOpen={showAdminPasswordResetDialog}
        onOpenChange={setShowAdminPasswordResetDialog}
        password={newUserPassword}
        onPasswordChange={setNewUserPassword}
        onResetPassword={handleAdminPasswordReset}
        isLoading={adminPasswordResetLoading}
      />

      {/* Actions outside of the table component */}
      <UserActions onCameraAssignmentButtonClick={handleCameraAssignmentButtonClick} />
    </AppLayout>
  );
};

export default UserManagement;
