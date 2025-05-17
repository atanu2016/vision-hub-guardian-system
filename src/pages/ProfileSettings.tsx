
import AppLayout from "@/components/layout/AppLayout";
import { PersonalInfoCard } from "@/components/profile/PersonalInfoCard";
import { SecuritySettingsCard } from "@/components/profile/SecuritySettingsCard";
import { useProfileSettings } from "@/hooks/useProfileSettings";
import { Loader2 } from "lucide-react";

const ProfileSettings = () => {
  const {
    user,
    profile,
    role,
    formData,
    avatarPreview,
    isLoading,
    handleInputChange,
    handleAvatarChange,
    handleProfileUpdate,
    handlePasswordUpdate,
    getInitials
  } = useProfileSettings();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p>Loading profile information...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <PersonalInfoCard
              formData={formData}
              role={role}
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
        )}
      </div>
    </AppLayout>
  );
};

export default ProfileSettings;
