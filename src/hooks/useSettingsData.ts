
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useDetectionSettings } from '@/hooks/useDetectionSettings';

export const useSettingsData = () => {
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  
  const {
    interfaceSettings,
    storageSettings,
    systemInformation,
    isLoading: isSystemLoading,
    isSaving: isSystemSaving,
    updateInterfaceSettings,
    updateStorageSettings,
    checkForUpdates,
    saveAllSettings,
    reloadSettings
  } = useSystemSettings();
  
  const {
    detectionSettings,
    isLoading: isDetectionLoading,
    isSaving: isDetectionSaving,
    loadDetectionSettings,
    updateDetectionSettings
  } = useDetectionSettings();
  
  const isLoading = isSystemLoading || isDetectionLoading;
  const isSaving = isSystemSaving || isDetectionSaving;
  
  // Use useEffect for loading data when component mounts
  useEffect(() => {
    console.log("useSettingsData: Loading settings...");
    const loadData = async () => {
      try {
        setIsLoadingInitial(true);
        await Promise.all([
          reloadSettings(true), // Force refresh
          loadDetectionSettings()
        ]);
        console.log("useSettingsData: Settings loaded successfully");
      } catch (error) {
        console.error("useSettingsData: Failed to load settings", error);
        toast.error("Failed to load settings");
      } finally {
        setIsLoadingInitial(false);
      }
    };
    
    loadData();
  }, [reloadSettings, loadDetectionSettings]);

  return {
    // Interface settings
    interfaceSettings,
    updateInterfaceSettings,
    
    // Detection settings
    detectionSettings,
    updateDetectionSettings,
    
    // Storage settings
    storageSettings,
    updateStorageSettings,
    
    // System information
    systemInformation,
    checkForUpdates,
    
    // Loading and saving states
    isLoading: isLoading || isLoadingInitial,
    isSaving,
    
    // Actions
    saveAllSettings,
    reloadSettings,
    loadDetectionSettings
  };
};
