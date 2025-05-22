
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
      <SettingsHeader title="System Settings" description="Configure system appearance and behavior" />
      
      <SettingsGrid>
        <InterfaceSettings
          settings={interfaceSettings}
          onUpdate={updateInterfaceSettings}
          isSaving={isSaving}
        />
        
        <DetectionSettings
          settings={detectionSettings}
          onUpdate={updateDetectionSettings}
          isSaving={isSaving}
        />
        
        <StorageSettings
          settings={storageSettings}
          onUpdate={updateStorageSettings}
          isSaving={isSaving}
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
