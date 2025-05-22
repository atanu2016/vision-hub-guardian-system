
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StorageSettings as StorageSettingsType } from "@/types/camera";
import { useStorageSettings } from "@/hooks/storage";
import StorageUsageDisplay from "@/components/settings/storage/StorageUsageDisplay";
import StorageForm from "@/components/settings/storage/StorageForm";
import { useStorageAdapter } from "@/hooks/storage/useStorageAdapter";

// Refactored StorageSettings component
const StorageSettings = () => {
  // Use the custom hook for storage settings
  const {
    storageUsage,
    isLoading,
    isSaving,
    isClearing,
    loadStorageSettings,
    fetchStorageUsage,
    handleSaveSettings,
    handleClearStorage
  } = useStorageSettings();

  // Get storage adapter
  const { toFormData } = useStorageAdapter();

  // Initial settings state
  const [settings, setSettings] = useState<StorageSettingsType>({
    type: "local",
    path: "/recordings",
    retentiondays: 30,
    overwriteoldest: true,
  });

  // Load storage settings on mount
  useEffect(() => {
    const initialize = async () => {
      const loadedSettings = await loadStorageSettings();
      if (loadedSettings) {
        setSettings(loadedSettings);
      }
    };

    initialize();
  }, []);

  // Handle refresh of storage data
  const handleRefreshStorage = async () => {
    await fetchStorageUsage();
  };

  // Create a compatible display object for StorageUsageDisplay from storageUsage
  const displayUsage = {
    usedSpace: storageUsage.usedSpace,
    totalSpace: storageUsage.totalSpace,
    usedPercentage: storageUsage.usedPercentage,
    usedSpaceFormatted: storageUsage.usedSpaceFormatted,
    totalSpaceFormatted: storageUsage.totalSpaceFormatted
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Storage Settings</h1>
        <p className="text-muted-foreground">
          Manage your system's storage usage and retention policies
        </p>
      </div>

      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">Storage Usage</TabsTrigger>
          <TabsTrigger value="settings">Storage Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Storage Usage</CardTitle>
              <CardDescription>
                View your current storage usage and manage recordings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <StorageUsageDisplay
                storageUsage={displayUsage}
                retentionDays={settings.retentiondays}
                isClearing={isClearing}
                onClearStorage={handleClearStorage}
                onRefreshStorage={handleRefreshStorage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <StorageForm
            initialSettings={settings}
            isLoading={isLoading}
            isSaving={isSaving}
            onSave={async (updatedSettings) => {
              const success = await handleSaveSettings(updatedSettings);
              if (success) {
                setSettings(updatedSettings);
              }
              return success;
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StorageSettings;
