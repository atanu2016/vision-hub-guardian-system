
import { memo } from 'react';
import { useSettingsData } from '@/hooks/useSettingsData';

// Import settings section components
import InterfaceSettings from '@/components/settings/sections/InterfaceSettings';
import DetectionSettings from '@/components/settings/sections/DetectionSettings';
import StorageSettings from '@/components/settings/sections/StorageSettings';
import SystemInformation from '@/components/settings/sections/SystemInformation';
import LoadingSpinner from '@/components/settings/sections/LoadingSpinner';
import SettingsHeader from '@/components/settings/sections/SettingsHeader';
import SettingsGrid from '@/components/settings/sections/SettingsGrid';
import SettingsSection from '@/components/settings/sections/SettingsSection';

// Memoized section components for better performance
const MemoizedInterfaceSettings = memo(InterfaceSettings);
const MemoizedDetectionSettings = memo(DetectionSettings);
const MemoizedStorageSettings = memo(StorageSettings);
const MemoizedSystemInformation = memo(SystemInformation);

const SystemSettingsMain = () => {
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
  } = useSettingsData();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full">
      <SettingsHeader onSaveAll={saveAllSettings} isSaving={isSaving} />
      
      <SettingsGrid>
        {/* Interface Settings */}
        <SettingsSection>
          <MemoizedInterfaceSettings 
            darkMode={interfaceSettings.darkMode}
            notifications={interfaceSettings.notifications}
            audio={interfaceSettings.audio}
            onChangeDarkMode={(enabled) => updateInterfaceSettings({...interfaceSettings, darkMode: enabled})}
            onChangeNotifications={(enabled) => updateInterfaceSettings({...interfaceSettings, notifications: enabled})}
            onChangeAudio={(enabled) => updateInterfaceSettings({...interfaceSettings, audio: enabled})}
          />
        </SettingsSection>
        
        {/* Detection Settings */}
        <SettingsSection>
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
        </SettingsSection>
        
        {/* Storage Settings */}
        <SettingsSection>
          <MemoizedStorageSettings 
            autoDeleteOld={storageSettings.autoDeleteOld}
            maxStorageSize={storageSettings.maxStorageSize}
            backupSchedule={storageSettings.backupSchedule}
            onChangeAutoDeleteOld={(enabled) => updateStorageSettings({...storageSettings, autoDeleteOld: enabled})}
            onChangeMaxStorageSize={(size) => updateStorageSettings({...storageSettings, maxStorageSize: size})}
            onChangeBackupSchedule={(schedule) => updateStorageSettings({...storageSettings, backupSchedule: schedule})}
          />
        </SettingsSection>
        
        {/* System Information */}
        <SettingsSection>
          <MemoizedSystemInformation 
            userInfo={systemInformation.userInfo}
            systemInfo={systemInformation.systemInfo}
            onCheckForUpdates={checkForUpdates}
          />
        </SettingsSection>
      </SettingsGrid>
    </div>
  );
};

export default SystemSettingsMain;
