
import AppLayout from "@/components/layout/AppLayout";
import { PersonalInfoCard } from "@/components/profile/PersonalInfoCard";
import { SecuritySettingsCard } from "@/components/profile/SecuritySettingsCard";
import { useProfileSettings } from "@/hooks/useProfileSettings";
import { useEffect } from "react";

const ProfileSettings = () => {
  const {
    user,
    profile,
    role,
    formData,
    avatarPreview,
    handleInputChange,
    handleAvatarChange,
    handleProfileUpdate,
    handlePasswordUpdate,
    getInitials
  } = useProfileSettings();

  useEffect(() => {
    // Add logging for debugging
    console.log("ProfileSettings component:", {
      userExists: !!user,
      profileExists: !!profile,
      role,
      formData
    });
  }, [user, profile, role, formData]);

  if (!user) {
    console.log("ProfileSettings: No user found");
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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

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
      </div>
    </AppLayout>
  );
};

export default ProfileSettings;
