
import { useState } from 'react';
import { useSettingsData } from '@/hooks/useSettingsData';
import SettingsHeader from './SettingsHeader';
import SettingsGrid from './SettingsGrid';
import InterfaceSettings from './InterfaceSettings';
import DetectionSettings from './DetectionSettings';
import StorageSettings from './StorageSettings';
import SystemInformation from './SystemInformation';
import LoadingSpinner from './LoadingSpinner';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const SystemSettingsMain = () => {
  const {
    interfaceSettings,
    detectionSettings,
    storageSettings,
    systemInformation,
    updateInterfaceSettings,
    updateDetectionSettings,
    updateStorageSettings,
    checkForUpdates,
    isLoading,
    isSaving,
  } = useSettingsData();
  
  const navigate = useNavigate();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }

  const handleSystemUpdate = () => {
    navigate('/settings/system-update');
  };

  return (
    <div className="space-y-6">
      <SettingsHeader 
        onSaveAll={() => {}} 
        isSaving={isSaving}
      />
      
      <SettingsGrid>
        <InterfaceSettings
          darkMode={interfaceSettings.darkMode}
          notifications={interfaceSettings.notifications}
          audio={interfaceSettings.audio}
          onChangeDarkMode={(enabled) => updateInterfaceSettings({ ...interfaceSettings, darkMode: enabled })}
          onChangeNotifications={(enabled) => updateInterfaceSettings({ ...interfaceSettings, notifications: enabled })}
          onChangeAudio={(enabled) => updateInterfaceSettings({ ...interfaceSettings, audio: enabled })}
        />
        
        <DetectionSettings
          sensitivityLevel={detectionSettings.sensitivityLevel}
          enabled={detectionSettings.enabled}
          objectTypes={detectionSettings.objectTypes}
          smartDetection={detectionSettings.smartDetection}
          onChangeSensitivity={(value) => updateDetectionSettings({ sensitivityLevel: value[0] })}
          onChangeEnabled={(enabled) => updateDetectionSettings({ enabled })}
          onChangeObjectTypes={(types) => updateDetectionSettings({ objectTypes: types })}
          onChangeSmartDetection={(enabled) => updateDetectionSettings({ smartDetection: enabled })}
        />
        
        <StorageSettings
          autoDeleteOld={storageSettings.autoDeleteOld}
          maxStorageSize={storageSettings.maxStorageSize}
          backupSchedule={storageSettings.backupSchedule}
          onChangeAutoDeleteOld={(enabled) => updateStorageSettings({ ...storageSettings, autoDeleteOld: enabled })}
          onChangeMaxStorageSize={(size) => updateStorageSettings({ ...storageSettings, maxStorageSize: size })}
          onChangeBackupSchedule={(schedule) => updateStorageSettings({ ...storageSettings, backupSchedule: schedule })}
        />
        
        <SystemInformation
          userInfo={systemInformation.userInfo}
          systemInfo={systemInformation.systemInfo}
          onCheckForUpdates={checkForUpdates}
        />
      </SettingsGrid>
      
      <div className="flex justify-end pt-6">
        <Button onClick={handleSystemUpdate} variant="outline">
          System Update & Maintenance
        </Button>
      </div>
    </div>
  );
};

export default SystemSettingsMain;
