
import { useState } from 'react';
import { StorageSettings as StorageSettingsType } from '@/types/camera';
import { getStorageSettings } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';
import { useStorageUsage } from './useStorageUsage';
import { useStorageOperations } from './useStorageOperations';

export const useStorageSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const { storageUsage, fetchStorageUsage } = useStorageUsage();
  const { isSaving, isClearing, handleSaveSettings, handleClearStorage } = useStorageOperations();

  // Load storage settings from API
  const loadStorageSettings = async () => {
    setIsLoading(true);
    try {
      const settings = await getStorageSettings();
      
      // Fetch storage usage data
      await fetchStorageUsage();
      
      return settings;
    } catch (error) {
      console.error("Failed to load storage settings:", error);
      toast({
        title: "Error Loading Settings",
        description: "Could not load storage settings. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    storageUsage,
    isLoading,
    isSaving,
    isClearing,
    loadStorageSettings,
    fetchStorageUsage,
    handleSaveSettings,
    handleClearStorage
  };
};
