
import AppLayout from "@/components/layout/AppLayout";
import { PersonalInfoCard } from "@/components/profile/PersonalInfoCard";
import { SecuritySettingsCard } from "@/components/profile/SecuritySettingsCard";
import { useProfileSettings } from "@/hooks/useProfileSettings";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const ProfileSettings = () => {
  const {
    user,
    isLoading,
    fullName,
    email,
    userRole,
    formData,
    isSaving,
    handleInputChange,
    handleSaveChanges,
    handlePasswordUpdate
  } = useProfileSettings();

  // Add logging for debugging
  useEffect(() => {
    console.log("ProfileSettings component rendered:", {
      userExists: !!user,
      fullName,
      email,
      userRole,
      isLoading
    });
  }, [user, fullName, email, userRole, isLoading]);

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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <PersonalInfoCard />
          <SecuritySettingsCard />
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfileSettings;
