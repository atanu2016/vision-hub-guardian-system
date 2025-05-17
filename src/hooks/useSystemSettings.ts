
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  fetchInterfaceSettings, 
  saveInterfaceSettings,
  fetchDetectionSettings,
  saveDetectionSettings,
  fetchAdditionalStorageSettings,
  saveAdditionalStorageSettings,
  fetchSystemInformation
} from '@/services/database/systemSettingsService';

export const useSystemSettings = () => {
  // Interface settings
  const [interfaceSettings, setInterfaceSettings] = useState({
    darkMode: false,
    notifications: true,
    audio: true
  });
  
  // Detection settings
  const [detectionSettings, setDetectionSettings] = useState({
    sensitivityLevel: 50
  });
  
  // Storage settings
  const [storageSettings, setStorageSettings] = useState({
    autoDeleteOld: true,
    maxStorageSize: 500,
    backupSchedule: 'never'
  });
  
  // System information
  const [systemInformation, setSystemInformation] = useState({
    userInfo: {
      username: 'Admin',
      role: 'admin',
      email: 'admin@example.com'
    },
    systemInfo: {
      version: '1.0.0',
      license: 'Active',
      lastUpdated: 'Today at 9:41 AM'
    }
  });
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch all settings
  const loadAllSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const [interfaceData, detectionData, storageData, systemData] = await Promise.all([
        fetchInterfaceSettings(),
        fetchDetectionSettings(),
        fetchAdditionalStorageSettings(),
        fetchSystemInformation()
      ]);
      
      setInterfaceSettings(interfaceData);
      setDetectionSettings(detectionData);
      setStorageSettings(storageData);
      setSystemInformation(systemData);
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Load settings on mount
  useEffect(() => {
    loadAllSettings();
  }, [loadAllSettings]);
  
  // Update interface settings
  const updateInterfaceSettings = useCallback(async (settings) => {
    setIsSaving(true);
    try {
      await saveInterfaceSettings(settings);
      setInterfaceSettings(settings);
    } catch (error) {
      console.error("Error saving interface settings:", error);
      toast.error("Failed to save interface settings");
    } finally {
      setIsSaving(false);
    }
  }, []);
  
  // Update detection settings
  const updateDetectionSettings = useCallback(async (settings) => {
    setIsSaving(true);
    try {
      await saveDetectionSettings(settings);
      setDetectionSettings(settings);
    } catch (error) {
      console.error("Error saving detection settings:", error);
      toast.error("Failed to save detection settings");
    } finally {
      setIsSaving(false);
    }
  }, []);
  
  // Update storage settings
  const updateStorageSettings = useCallback(async (settings) => {
    setIsSaving(true);
    try {
      await saveAdditionalStorageSettings(settings);
      setStorageSettings(settings);
    } catch (error) {
      console.error("Error saving storage settings:", error);
      toast.error("Failed to save storage settings");
    } finally {
      setIsSaving(false);
    }
  }, []);
  
  // Check for updates
  const checkForUpdates = useCallback(() => {
    toast.info("Checking for updates...");
    // Simulate update check
    setTimeout(() => {
      toast.success("Your system is up to date");
    }, 2000);
  }, []);
  
  // Save all settings at once
  const saveAllSettings = useCallback(async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        saveInterfaceSettings(interfaceSettings),
        saveDetectionSettings(detectionSettings),
        saveAdditionalStorageSettings(storageSettings)
      ]);
      toast.success("All settings saved successfully");
    } catch (error) {
      console.error("Error saving all settings:", error);
      toast.error("Failed to save all settings");
    } finally {
      setIsSaving(false);
    }
  }, [interfaceSettings, detectionSettings, storageSettings]);
  
  return {
    interfaceSettings,
    detectionSettings,
    storageSettings,
    systemInformation,
    isLoading,
    isSaving,
    updateInterfaceSettings,
    updateDetectionSettings,
    updateStorageSettings,
    checkForUpdates,
    saveAllSettings,
    reloadSettings: loadAllSettings
  };
};
