import AppLayout from "@/components/layout/AppLayout";
import { PersonalInfoCard } from "@/components/profile/PersonalInfoCard";
import { SecuritySettingsCard } from "@/components/profile/SecuritySettingsCard";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from '@/contexts/auth';
import { RoleDiagnosticTool } from "@/components/admin/RoleDiagnosticTool";
import { Button } from "@/components/ui/button";
import { useProfileSettings } from '@/hooks/useProfileSettings';
import { useAvatarManagement } from '@/hooks/profile/useAvatarManagement';
import { usePasswordUpdate } from '@/hooks/profile/usePasswordUpdate';

const ProfileSettings = () => {
  const { user } = useAuth();
  const {
    fullName,
    email,
    userRole,
    isLoading,
    isSaving,
    setFullName,
    handleSaveChanges
  } = useProfileSettings();
  
  const { avatarPreview, handleAvatarChange, getInitials } = useAvatarManagement();
  const { handlePasswordUpdate: updatePassword } = usePasswordUpdate();

  // Create formData object to match what the components expect
  const formData = {
    fullName,
    email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  
  // Debug tools state
  const [showDebugTools, setShowDebugTools] = useState(true);

  const toggleDebugTools = () => {
    setShowDebugTools(prev => !prev);
  };
  
  // Create handlers that will work with our components
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'fullName') {
      setFullName(value);
    }
    // Other fields would be handled here
  };
  
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveChanges();
  };
  
  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updatePassword(e, {
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p>Loading profile information...</p>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <p>Please log in to view your profile settings.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleDebugTools}
            className="text-xs"
          >
            {showDebugTools ? 'Hide Debug Tools' : 'Show Debug Tools'}
          </Button>
        </div>

        {/* Debug section */}
        {showDebugTools && (
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-4">Role Debug Information</h2>
            <RoleDiagnosticTool />
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <PersonalInfoCard
            formData={formData}
            role={userRole}
            avatarPreview={avatarPreview}
            getInitials={getInitials}
            handleInputChange={handleInputChange}
            handleAvatarChange={handleAvatarChange}
            handleProfileUpdate={handleProfileUpdate}
          />

          <SecuritySettingsCard
            formData={formData}
            handleInputChange={handleInputChange}
            handlePasswordUpdate={handlePasswordUpdate}
          />
        </div>
      </div>
    </AppLayout>
  );
}

export default ProfileSettings;
