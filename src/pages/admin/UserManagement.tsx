
import { UserTable } from "@/components/admin/UserTable";
import { UserManagementHeader } from "@/components/admin/UserManagementHeader";
import { ErrorAlert } from "@/components/admin/ErrorAlert";
import { useState } from "react";
import { useUserManagement } from "@/hooks/useUserManagement";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/auth";
import { usePermissions } from "@/hooks/usePermissions";
import { Camera, Key } from "lucide-react";
import CameraAssignmentModal from "@/components/admin/CameraAssignmentModal";
import { Button } from "@/components/ui/button";
import { UserData } from "@/types/admin";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/settings/sections/LoadingSpinner";
import { adminResetUserPassword, resetPassword } from "@/contexts/auth/authActions";

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
  const [showUserSelector, setShowUserSelector] = useState(false);
  
  // States for password reset functionality
  const [showPasswordResetDialog, setShowPasswordResetDialog] = useState(false);
  const [passwordResetEmail, setPasswordResetEmail] = useState('');
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  const [showEmailResetDialog, setShowEmailResetDialog] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  
  // New state for admin direct password reset
  const [showAdminPasswordResetDialog, setShowAdminPasswordResetDialog] = useState(false);
  const [newUserPassword, setNewUserPassword] = useState('');
  const [adminPasswordResetLoading, setAdminPasswordResetLoading] = useState(false);

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

  const handleResetPassword = async (userId: string, userEmail: string) => {
    // Store the selected user's email and ID
    setSelectedUserId(userId);
    
    // Check if we have a valid email address for sending reset email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (userEmail && emailRegex.test(userEmail)) {
      // If valid email, use email reset flow
      setSelectedUserEmail(userEmail);
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
      // Ensure we're sending to a real email address, not a UUID
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(passwordResetEmail)) {
        toast.error("Please enter a valid email address (e.g. user@example.com)");
        setPasswordResetLoading(false);
        return;
      }
      
      await resetPassword(passwordResetEmail);
      setPasswordResetLoading(false);
      setShowEmailResetDialog(false);
      // Email sent toast is handled in the resetPassword function
    } catch (error) {
      setPasswordResetLoading(false);
      // Error toast is handled in the resetPassword function
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
      setShowAdminPasswordResetDialog(false);
      setNewUserPassword('');
      toast.success("User password has been reset successfully");
    } catch (error) {
      // Error is handled in adminResetUserPassword function
    } finally {
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

      {selectedUserId && (
        <CameraAssignmentModal
          isOpen={showCameraAssignment}
          userId={selectedUserId}
          userName={selectedUserName}
          onClose={handleCameraAssignmentClose}
        />
      )}

      {/* User selector modal for camera assignment */}
      {showUserSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border rounded-lg shadow-lg p-6 w-[500px] max-w-[90vw] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Select User</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowUserSelector(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-2 mt-4">
              {users.map(user => (
                <div 
                  key={user.id}
                  className="p-3 border rounded-md hover:bg-accent cursor-pointer flex items-center justify-between"
                  onClick={() => handleUserSelect(user)}
                >
                  <div>
                    <p className="font-medium">{user.email || "No email"}</p>
                    <p className="text-sm text-muted-foreground">{user.full_name || "No name"} • {user.role}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Camera className="h-4 w-4 mr-1" />
                    Assign
                  </Button>
                </div>
              ))}
              
              {users.length === 0 && !loading && (
                <div className="text-center py-4 text-muted-foreground">
                  No users found
                </div>
              )}
              
              {loading && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin h-6 w-6 border-t-2 border-b-2 border-primary rounded-full"></div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setShowUserSelector(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Email Dialog */}
      <Dialog open={showEmailResetDialog} onOpenChange={setShowEmailResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Password Reset Email</DialogTitle>
            <DialogDescription>
              Send a password reset link to the user's email address. They will be able to set a new password.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="resetEmail">Email Address</Label>
              <Input
                id="resetEmail"
                placeholder="user@example.com"
                value={passwordResetEmail}
                onChange={(e) => setPasswordResetEmail(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailResetDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendPasswordResetEmail} disabled={passwordResetLoading}>
              {passwordResetLoading ? (
                <>
                  <div className="mr-2">
                    <LoadingSpinner />
                  </div>
                  Sending...
                </>
              ) : (
                'Send Reset Email'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Admin Direct Password Reset Dialog */}
      <Dialog open={showAdminPasswordResetDialog} onOpenChange={setShowAdminPasswordResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin: Set New Password</DialogTitle>
            <DialogDescription>
              As an admin, you can directly set a new password for this user.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">Password must be at least 6 characters long.</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdminPasswordResetDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAdminPasswordReset} 
              disabled={adminPasswordResetLoading || !newUserPassword || newUserPassword.length < 6}
            >
              {adminPasswordResetLoading ? (
                <>
                  <div className="mr-2">
                    <LoadingSpinner />
                  </div>
                  Resetting...
                </>
              ) : (
                'Set New Password'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add assign cameras button outside of the table component */}
      {hasPermission('assign-cameras') && (
        <div className="flex justify-end mt-4">
          <Button 
            variant="outline" 
            onClick={handleCameraAssignmentButtonClick}
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
