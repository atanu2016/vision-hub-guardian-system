
import { useState, useEffect } from "react";
import { StorageSettings as StorageSettingsType } from "@/types/camera";
import { getStorageSettings, saveStorageSettings } from "@/services/apiService";
import { StorageFormSchemaType } from "@/components/settings/storage/StorageForm";
import { useToast } from "@/hooks/use-toast";
import { useStorageValidation } from "@/hooks/storage/useStorageValidation";
import { useStorageUsage } from "@/hooks/storage/useStorageUsage";

export const useStorageSettingsPage = () => {
  const [settings, setSettings] = useState<StorageSettingsType>({
    type: 'local',
    path: '/recordings',
    retentiondays: 30,
    overwriteoldest: true
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState(false);
  const { validateStorage } = useStorageValidation();
  const { toast } = useToast();
  const { storageUsage, fetchStorageUsage } = useStorageUsage();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await getStorageSettings();
      if (data) {
        setSettings(data);
      }
      
      // Load fresh storage usage data
      await fetchStorageUsage();
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

  const handleSaveSettings = async (newSettings: StorageFormSchemaType) => {
    setIsSaving(true);
    try {
      // Validate the settings first
      const isValid = await validateStorage(newSettings as StorageSettingsType);
      
      if (!isValid) {
        toast({
          title: "Validation Failed",
          description: "Storage settings failed validation. Please check your settings.",
          variant: "destructive"
        });
        return false;
      }
      
      // Save the settings
      const success = await saveStorageSettings(newSettings as StorageSettingsType);
      
      if (success) {
        setSettings(newSettings as StorageSettingsType);
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
      await fetchStorageUsage();
      
      return true;
    } catch (error) {
      console.error("Error clearing storage:", error);
      toast({
        title: "Error",
        description: "Failed to clear storage",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsClearing(false);
    }
  };

  return {
    settings,
    storageUsage,
    isLoading,
    isSaving,
    isClearing,
    handleSaveSettings,
    handleClearStorage,
    setSettings
  };
};
