import { useState, useEffect, useCallback, memo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useDetectionSettings } from '@/hooks/useDetectionSettings';

// Import setting section components
import InterfaceSettings from '@/components/settings/sections/InterfaceSettings';
import DetectionSettings from '@/components/settings/sections/DetectionSettings';
import StorageSettings from '@/components/settings/sections/StorageSettings';
import SystemInformation from '@/components/settings/sections/SystemInformation';

// Memoized section components for better performance
const MemoizedInterfaceSettings = memo(InterfaceSettings);
const MemoizedDetectionSettings = memo(DetectionSettings);
const MemoizedStorageSettings = memo(StorageSettings);
const MemoizedSystemInformation = memo(SystemInformation);

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
  </div>
);

const SystemSettingsMain = () => {
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
    console.log("SystemSettingsMain: Loading settings...");
    const loadData = async () => {
      try {
        await Promise.all([
          reloadSettings(true), // Force refresh
          loadDetectionSettings()
        ]);
        console.log("SystemSettingsMain: Settings loaded successfully");
      } catch (error) {
        console.error("SystemSettingsMain: Failed to load settings", error);
        toast.error("Failed to load settings");
      }
    };
    
    loadData();
  }, [reloadSettings, loadDetectionSettings]);

  // Optimized handlers with useCallback to prevent recreation on each render
  const handleDarkModeChange = useCallback((enabled: boolean) => {
    updateInterfaceSettings({
      ...interfaceSettings,
      darkMode: enabled
    });
  }, [interfaceSettings, updateInterfaceSettings]);
  
  const handleNotificationsChange = useCallback((enabled: boolean) => {
    updateInterfaceSettings({
      ...interfaceSettings,
      notifications: enabled
    });
  }, [interfaceSettings, updateInterfaceSettings]);
  
  const handleAudioChange = useCallback((enabled: boolean) => {
    updateInterfaceSettings({
      ...interfaceSettings,
      audio: enabled
    });
  }, [interfaceSettings, updateInterfaceSettings]);
  
  // Handle detection settings changes
  const handleSensitivityChange = useCallback((value: number[]) => {
    updateDetectionSettings({
      sensitivityLevel: value[0]
    });
  }, [updateDetectionSettings]);
  
  const handleDetectionEnabledChange = useCallback((enabled: boolean) => {
    updateDetectionSettings({
      enabled: enabled
    });
  }, [updateDetectionSettings]);
  
  const handleObjectTypesChange = useCallback((types: string[]) => {
    updateDetectionSettings({
      objectTypes: types
    });
  }, [updateDetectionSettings]);
  
  const handleSmartDetectionChange = useCallback((enabled: boolean) => {
    updateDetectionSettings({
      smartDetection: enabled
    });
  }, [updateDetectionSettings]);
  
  // Handle storage settings changes
  const handleAutoDeleteChange = useCallback((enabled: boolean) => {
    updateStorageSettings({
      ...storageSettings,
      autoDeleteOld: enabled
    });
  }, [storageSettings, updateStorageSettings]);
  
  const handleMaxStorageSizeChange = useCallback((size: number) => {
    updateStorageSettings({
      ...storageSettings,
      maxStorageSize: size
    });
  }, [storageSettings, updateStorageSettings]);
  
  const handleBackupScheduleChange = useCallback((schedule: string) => {
    updateStorageSettings({
      ...storageSettings,
      backupSchedule: schedule
    });
  }, [storageSettings, updateStorageSettings]);

  const handleSaveAll = useCallback(() => {
    saveAllSettings();
    toast.success("All settings saved successfully");
  }, [saveAllSettings]);

  console.log("SystemSettingsMain: Rendering with loading state:", isLoading);
  console.log("SystemSettingsMain: Detection settings:", detectionSettings);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">System Settings</h2>
        <Button 
          onClick={saveAllSettings}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save All Changes
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Interface Settings */}
        <Card className="p-6">
          <MemoizedInterfaceSettings 
            darkMode={interfaceSettings.darkMode}
            notifications={interfaceSettings.notifications}
            audio={interfaceSettings.audio}
            onChangeDarkMode={(enabled) => updateInterfaceSettings({...interfaceSettings, darkMode: enabled})}
            onChangeNotifications={(enabled) => updateInterfaceSettings({...interfaceSettings, notifications: enabled})}
            onChangeAudio={(enabled) => updateInterfaceSettings({...interfaceSettings, audio: enabled})}
          />
        </Card>
        
        {/* Detection Settings */}
        <Card className="p-6">
          <MemoizedDetectionSettings 
            sensitivityLevel={detectionSettings.sensitivityLevel}
            enabled={detectionSettings.enabled}
            objectTypes={detectionSettings.objectTypes}
            smartDetection={detectionSettings.smartDetection}
            onChangeSensitivity={(value) => updateDetectionSettings({sensitivityLevel: value[0]})}
            onChangeEnabled={(enabled) => updateDetectionSettings({enabled})}
            onChangeObjectTypes={(types) => updateDetectionSettings({objectTypes: types})}
            onChangeSmartDetection={(enabled) => updateDetectionSettings({smartDetection: enabled})}
          />
        </Card>
        
        {/* Storage Settings */}
        <Card className="p-6">
          <MemoizedStorageSettings 
            autoDeleteOld={storageSettings.autoDeleteOld}
            maxStorageSize={storageSettings.maxStorageSize}
            backupSchedule={storageSettings.backupSchedule}
            onChangeAutoDeleteOld={(enabled) => updateStorageSettings({...storageSettings, autoDeleteOld: enabled})}
            onChangeMaxStorageSize={(size) => updateStorageSettings({...storageSettings, maxStorageSize: size})}
            onChangeBackupSchedule={(schedule) => updateStorageSettings({...storageSettings, backupSchedule: schedule})}
          />
        </Card>
        
        {/* System Information */}
        <Card className="p-6">
          <MemoizedSystemInformation 
            userInfo={systemInformation.userInfo}
            systemInfo={systemInformation.systemInfo}
            onCheckForUpdates={checkForUpdates}
          />
        </Card>
      </div>
    </div>
  );
};

export default SystemSettingsMain;
