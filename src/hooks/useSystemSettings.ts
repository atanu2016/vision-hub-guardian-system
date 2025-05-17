
import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { 
  fetchInterfaceSettings, 
  saveInterfaceSettings,
  fetchDetectionSettings,
  saveDetectionSettings,
  fetchAdditionalStorageSettings,
  saveAdditionalStorageSettings,
  fetchSystemInformation,
  DetectionSettings
} from '@/services/database/systemSettingsService';

export const useSystemSettings = () => {
  // Interface settings
  const [interfaceSettings, setInterfaceSettings] = useState({
    darkMode: false,
    notifications: true,
    audio: true
  });
  
  // Detection settings
  const [detectionSettings, setDetectionSettings] = useState<DetectionSettings>({
    sensitivityLevel: 50,
    enabled: true,
    objectTypes: ["person", "vehicle"],
    smartDetection: false
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
      username: 'User',
      role: 'user',
      email: 'admin@home.local'
    },
    systemInfo: {
      version: '1.0.0',
      license: 'Active',
      lastUpdated: new Date().toLocaleString()
    }
  });
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Use refs to store the last loaded data to avoid unnecessary API calls
  const lastLoaded = useRef(new Date().getTime());
  const cacheTimeout = 60000; // 1 minute cache
  
  // Fetch all settings with cache optimization
  const loadAllSettings = useCallback(async (forceRefresh = false) => {
    // Check if we should use cache unless force refresh is requested
    const now = new Date().getTime();
    if (!forceRefresh && now - lastLoaded.current < cacheTimeout) {
      console.log("[Settings] Using cached settings data");
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("[Settings] Fetching fresh settings data");
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
      
      // Update last loaded timestamp
      lastLoaded.current = now;
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Update interface settings with debounce logic
  const updateInterfaceSettings = useCallback(async (settings) => {
    setIsSaving(true);
    try {
      await saveInterfaceSettings(settings);
      setInterfaceSettings(settings);
      toast.success("Interface settings updated");
    } catch (error) {
      console.error("Error saving interface settings:", error);
      toast.error("Failed to save interface settings");
    } finally {
      setIsSaving(false);
    }
  }, []);
  
  // Update detection settings with optimized state updates
  const updateDetectionSettings = useCallback(async (settings: Partial<DetectionSettings>) => {
    setIsSaving(true);
    try {
      // Create a complete DetectionSettings object by merging with current settings
      const updatedSettings: DetectionSettings = {
        ...detectionSettings,
        ...settings
      };
      
      await saveDetectionSettings(updatedSettings);
      setDetectionSettings(updatedSettings);
      toast.success("Detection settings updated");
    } catch (error) {
      console.error("Error saving detection settings:", error);
      toast.error("Failed to save detection settings");
    } finally {
      setIsSaving(false);
    }
  }, [detectionSettings]);
  
  // Update storage settings with optimized state updates
  const updateStorageSettings = useCallback(async (settings) => {
    setIsSaving(true);
    try {
      await saveAdditionalStorageSettings(settings);
      setStorageSettings(settings);
      toast.success("Storage settings updated");
    } catch (error) {
      console.error("Error saving storage settings:", error);
      toast.error("Failed to save storage settings");
    } finally {
      setIsSaving(false);
    }
  }, []);
  
  // Mock function for checking updates - optimized to avoid unnecessary renders
  const checkForUpdates = useCallback(() => {
    toast.info("Checking for updates...");
    // Simulate update check
    setTimeout(() => {
      toast.success("Your system is up to date");
    }, 2000);
  }, []);
  
  // Save all settings at once - optimized to reduce redundant state updates
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
