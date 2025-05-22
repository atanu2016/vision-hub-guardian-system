
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AppLayout from "@/components/layout/AppLayout";
import { StorageFormSchema, StorageFormSchemaType } from "@/components/settings/storage/StorageForm";
import { useStorageSettingsPage } from "@/hooks/storage/useStorageSettingsPage";
import StorageSettingsHeader from "@/components/settings/storage/StorageSettingsHeader";
import StorageUsageCard from "@/components/settings/storage/StorageUsageCard";
import StorageConfigCard from "@/components/settings/storage/StorageConfigCard";

const StorageSettings = () => {
  const {
    settings,
    storageUsage,
    isLoading,
    isSaving,
    isClearing,
    handleSaveSettings,
    handleClearStorage,
    setSettings
  } = useStorageSettingsPage();
  
  // Initialize form with react-hook-form
  const form = useForm<StorageFormSchemaType>({
    resolver: zodResolver(StorageFormSchema),
    defaultValues: {
      type: 'local',
      path: '/recordings',
      retentiondays: 30,
      overwriteoldest: true
    }
  });

  // Update form values when settings are loaded
  if (!isLoading && settings) {
    form.reset(settings);
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <StorageSettingsHeader />

          <div className="grid gap-6">
            <StorageUsageCard
              storageUsage={storageUsage}
              retentionDays={settings.retentiondays}
              isClearing={isClearing}
              onClearStorage={handleClearStorage}
            />

            <StorageConfigCard
              form={form}
              onSubmit={handleSaveSettings}
              isLoading={isLoading || isSaving}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StorageSettings;
