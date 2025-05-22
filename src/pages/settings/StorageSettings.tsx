
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getStorageSettings, saveStorageSettings } from "@/services/apiService";
import { StorageSettings as StorageSettingsType } from "@/types/camera";
import { useStorageValidation } from "@/hooks/storage/useStorageValidation";
import StorageForm, { StorageFormSchema, StorageFormSchemaType } from "@/components/settings/storage/StorageForm";
import AppLayout from "@/components/layout/AppLayout";
import StorageUsageDisplay from "@/components/settings/storage/StorageUsageDisplay";
import { useToast } from "@/hooks/use-toast";

// Define initial storage usage state
const initialStorageUsage = {
  usedSpace: 0,
  totalSpace: 1000,
  percentage: 0,
  usedPercentage: 0,
  usedSpaceFormatted: "0 GB",
  totalSpaceFormatted: "1 TB"
};

const StorageSettings = () => {
  const [settings, setSettings] = useState<StorageSettingsType>({
    type: 'local',
    path: '/recordings',
    retentiondays: 30,
    overwriteoldest: true
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [storageUsage, setStorageUsage] = useState(initialStorageUsage);
  const [isClearing, setIsClearing] = useState(false);
  const { validateStorage } = useStorageValidation();
  const { toast } = useToast();
  
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

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getStorageSettings();
        if (data) {
          setSettings(data);
          // Update form values with loaded settings
          form.reset(data);
        }
      } catch (error) {
        console.error("Failed to load storage settings:", error);
        toast({
          title: "Error",
          description: "Failed to load storage settings",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
    // Load storage usage data here (mock for now)
    setStorageUsage({
      usedSpace: 250,
      totalSpace: 1000,
      percentage: 25,
      usedPercentage: 25,
      usedSpaceFormatted: "250 GB",
      totalSpaceFormatted: "1 TB"
    });
  }, [toast, form]);

  const handleSaveSettings = async (newSettings: StorageFormSchemaType) => {
    setIsSaving(true);
    try {
      // Validate the settings first
      const isValid = await validateStorage(newSettings);
      
      if (!isValid) {
        toast({
          title: "Validation Failed",
          description: "Storage settings failed validation. Please check your settings.",
          variant: "destructive"
        });
        return false;
      }
      
      // Save the settings
      const success = await saveStorageSettings(newSettings);
      
      if (success) {
        setSettings(newSettings);
        toast({
          title: "Success",
          description: "Storage settings saved successfully",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to save storage settings",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Error saving storage settings:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearStorage = async () => {
    setIsClearing(true);
    try {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Success",
        description: "Storage cleared successfully",
      });
      
      // Update usage display
      setStorageUsage({
        ...storageUsage,
        usedSpace: 0,
        percentage: 0,
        usedPercentage: 0,
        usedSpaceFormatted: "0 GB"
      });
      
    } catch (error) {
      console.error("Error clearing storage:", error);
      toast({
        title: "Error",
        description: "Failed to clear storage",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Storage Settings</h2>
            <p className="text-muted-foreground">
              Configure where and how recordings are stored.
            </p>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Storage Usage</CardTitle>
                <CardDescription>
                  Current storage usage for all recordings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StorageUsageDisplay 
                  storageUsage={storageUsage}
                  retentionDays={settings.retentiondays}
                  isClearing={isClearing}
                  onClearStorage={handleClearStorage}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage Configuration</CardTitle>
                <CardDescription>
                  Configure storage location and retention policies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StorageForm
                  form={form}
                  onSubmit={handleSaveSettings}
                  isLoading={isLoading || isSaving}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StorageSettings;
