
import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

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
  const handleSensitivityChange = (value: number[]) => {
    updateDetectionSettings({
      ...detectionSettings,
      sensitivityLevel: value[0]
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
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">System Settings</h2>
        <Button 
          onClick={saveAllSettings}
          disabled={isLoading || isSaving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save All Changes
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Interface Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Interface Settings</h3>
          <div className="space-y-6">
            {/* Dark Mode */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Dark Mode</h4>
                <p className="text-sm text-muted-foreground">
                  Enable dark theme for the interface
                </p>
              </div>
              <Switch 
                checked={interfaceSettings.darkMode}
                onCheckedChange={handleDarkModeChange}
              />
            </div>
            
            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  Enable system notifications
                </p>
              </div>
              <Switch 
                checked={interfaceSettings.notifications}
                onCheckedChange={handleNotificationsChange}
              />
            </div>
            
            {/* Audio */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Audio</h4>
                <p className="text-sm text-muted-foreground">
                  Enable audio for live video
                </p>
              </div>
              <Switch 
                checked={interfaceSettings.audio}
                onCheckedChange={handleAudioChange}
              />
            </div>
          </div>
        </Card>
        
        {/* Detection Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Detection Settings</h3>
          <div className="space-y-6">
            {/* Motion Detection Sensitivity */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Motion Detection Sensitivity</h4>
                <p className="text-sm text-muted-foreground">
                  Adjust sensitivity level for motion detection
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Low</span>
                  <span className="text-sm">High</span>
                </div>
                <Slider 
                  value={[detectionSettings.sensitivityLevel]} 
                  max={100} 
                  step={1}
                  onValueChange={handleSensitivityChange}
                />
                <div className="text-right text-sm">
                  {detectionSettings.sensitivityLevel}%
                </div>
              </div>
            </div>
            
            {/* Advanced Detection Settings */}
            <div className="space-y-4">
              <h4 className="font-medium">Advanced Detection Settings</h4>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline">Configure Zones</Button>
                <Button variant="outline">Detection Rules</Button>
                <Button variant="outline">Object Detection</Button>
                <Button variant="outline">Face Recognition</Button>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Storage Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Storage Settings</h3>
          <div className="space-y-6">
            {/* Auto Delete Old Recordings */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Auto Delete Old Recordings</h4>
                <p className="text-sm text-muted-foreground">
                  Automatically delete recordings when storage is full
                </p>
              </div>
              <Switch 
                checked={storageSettings.autoDeleteOld} 
                onCheckedChange={handleAutoDeleteChange}
              />
            </div>
            
            {/* Max Storage Size */}
            <div>
              <h4 className="font-medium">Maximum Storage Size</h4>
              <div className="flex items-center mt-2">
                <input 
                  type="number" 
                  value={storageSettings.maxStorageSize}
                  onChange={(e) => handleMaxStorageSizeChange(parseInt(e.target.value))}
                  className="w-20 px-2 py-1 border rounded-md mr-2"
                />
                <span>GB</span>
              </div>
            </div>
            
            {/* Backup Schedule */}
            <div>
              <Label htmlFor="backupSchedule">Backup Schedule</Label>
              <select 
                id="backupSchedule"
                value={storageSettings.backupSchedule}
                onChange={(e) => handleBackupScheduleChange(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-background border border-input rounded-md"
              >
                <option value="never">Never</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </Card>
        
        {/* System Information */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">System Information</h3>
          <div className="space-y-6">
            {/* User Information */}
            <div>
              <h4 className="font-medium">User Information</h4>
              <div className="space-y-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Username</span>
                  <span>{systemInformation.userInfo.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Role</span>
                  <span>{systemInformation.userInfo.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span>{systemInformation.userInfo.email}</span>
                </div>
              </div>
            </div>
            
            {/* System Info */}
            <div>
              <h4 className="font-medium">System Info</h4>
              <div className="space-y-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Version</span>
                  <span>{systemInformation.systemInfo.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">License</span>
                  <span>{systemInformation.systemInfo.license}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <span>{systemInformation.systemInfo.lastUpdated}</span>
                </div>
              </div>
            </div>
            
            <div>
              <Button variant="outline" onClick={checkForUpdates}>
                Check for Updates
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SystemSettings;
