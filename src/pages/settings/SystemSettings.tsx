
import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/components/layout/AppLayout';
import { useSystemSettings } from '@/hooks/useSystemSettings';

// Import setting section components
import InterfaceSettings from '@/components/settings/sections/InterfaceSettings';
import DetectionSettings from '@/components/settings/sections/DetectionSettings';
import StorageSettings from '@/components/settings/sections/StorageSettings';
import SystemInformation from '@/components/settings/sections/SystemInformation';

const SystemSettings = () => {
  const {
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
    saveAllSettings
  } = useSystemSettings();
  
  // Handle interface settings changes
  const handleDarkModeChange = (enabled: boolean) => {
    updateInterfaceSettings({
      ...interfaceSettings,
      darkMode: enabled
    });
  };
  
  const handleNotificationsChange = (enabled: boolean) => {
    updateInterfaceSettings({
      ...interfaceSettings,
      notifications: enabled
    });
  };
  
  const handleAudioChange = (enabled: boolean) => {
    updateInterfaceSettings({
      ...interfaceSettings,
      audio: enabled
    });
  };
  
  // Handle detection settings changes
  const handleSensitivityChange = (value: number) => {
    updateDetectionSettings({
      ...detectionSettings,
      sensitivityLevel: value
    });
  };
  
  // Handle storage settings changes
  const handleAutoDeleteChange = (enabled: boolean) => {
    updateStorageSettings({
      ...storageSettings,
      autoDeleteOld: enabled
    });
  };
  
  const handleMaxStorageSizeChange = (size: number) => {
    updateStorageSettings({
      ...storageSettings,
      maxStorageSize: size
    });
  };
  
  const handleBackupScheduleChange = (schedule: string) => {
    updateStorageSettings({
      ...storageSettings,
      backupSchedule: schedule
    });
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">System Settings</h1>
          <Button 
            onClick={saveAllSettings}
            disabled={isLoading || isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            Save All Changes
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Interface Settings */}
          <Card className="p-6">
            <InterfaceSettings
              darkMode={interfaceSettings.darkMode}
              notifications={interfaceSettings.notifications}
              audio={interfaceSettings.audio}
              onChangeDarkMode={handleDarkModeChange}
              onChangeNotifications={handleNotificationsChange}
              onChangeAudio={handleAudioChange}
            />
          </Card>
          
          {/* Detection Settings */}
          <Card className="p-6">
            <DetectionSettings
              sensitivityLevel={detectionSettings.sensitivityLevel}
              onChangeSensitivityLevel={handleSensitivityChange}
            />
          </Card>
          
          {/* Storage Settings */}
          <Card className="p-6">
            <StorageSettings
              autoDeleteOld={storageSettings.autoDeleteOld}
              maxStorageSize={storageSettings.maxStorageSize}
              backupSchedule={storageSettings.backupSchedule}
              onChangeAutoDeleteOld={handleAutoDeleteChange}
              onChangeMaxStorageSize={handleMaxStorageSizeChange}
              onChangeBackupSchedule={handleBackupScheduleChange}
            />
          </Card>
          
          {/* System Information */}
          <Card className="p-6">
            <SystemInformation
              userInfo={systemInformation.userInfo}
              systemInfo={systemInformation.systemInfo}
              onCheckForUpdates={checkForUpdates}
            />
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default SystemSettings;
