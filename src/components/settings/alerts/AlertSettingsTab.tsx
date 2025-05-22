
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera } from '@/types/camera';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface AlertSettings {
  motion_detection: boolean;
  camera_offline: boolean;
  storage_warning: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  email_address?: string;
  notification_sound: string;
}

export interface AlertSettingsTabProps {
  alertSettings: AlertSettings;
  cameras: Camera[];
  saving: boolean;
  onSettingsChange: (settings: Partial<AlertSettings>) => void;
  onSaveSettings: () => Promise<boolean>;
  onCameraAlertLevelChange: (cameraId: string, level: 'low' | 'medium' | 'high' | 'none') => Promise<boolean>;
}

const AlertSettingsTab = ({
  alertSettings,
  cameras,
  saving,
  onSettingsChange,
  onSaveSettings,
  onCameraAlertLevelChange
}: AlertSettingsTabProps) => {
  const [activeTab, setActiveTab] = useState('general');
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [alertLevel, setAlertLevel] = useState<'low' | 'medium' | 'high' | 'none'>('medium');

  const handleSwitchChange = (field: keyof AlertSettings) => (checked: boolean) => {
    onSettingsChange({ [field]: checked });
  };

  const handleInputChange = (field: keyof AlertSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ [field]: e.target.value });
  };

  const handleSelectChange = (field: keyof AlertSettings) => (value: string) => {
    onSettingsChange({ [field]: value });
  };

  const handleSaveAlertLevel = async () => {
    if (selectedCameraId) {
      await onCameraAlertLevelChange(selectedCameraId, alertLevel);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="general">General Alerts</TabsTrigger>
          <TabsTrigger value="notifications">Notification Settings</TabsTrigger>
          <TabsTrigger value="cameras">Camera-specific Alerts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert Triggers</CardTitle>
              <CardDescription>Configure what events trigger alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label htmlFor="motion_detection" className="text-base">Motion Detection</Label>
                  <p className="text-sm text-muted-foreground">Alert when motion is detected</p>
                </div>
                <Switch 
                  id="motion_detection" 
                  checked={alertSettings.motion_detection}
                  onCheckedChange={handleSwitchChange('motion_detection')}
                />
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label htmlFor="camera_offline" className="text-base">Camera Offline</Label>
                  <p className="text-sm text-muted-foreground">Alert when a camera goes offline</p>
                </div>
                <Switch 
                  id="camera_offline" 
                  checked={alertSettings.camera_offline}
                  onCheckedChange={handleSwitchChange('camera_offline')}
                />
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label htmlFor="storage_warning" className="text-base">Storage Warning</Label>
                  <p className="text-sm text-muted-foreground">Alert when storage is running low</p>
                </div>
                <Switch 
                  id="storage_warning" 
                  checked={alertSettings.storage_warning}
                  onCheckedChange={handleSwitchChange('storage_warning')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Methods</CardTitle>
              <CardDescription>How you want to receive alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label htmlFor="email_notifications" className="text-base">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                </div>
                <Switch 
                  id="email_notifications" 
                  checked={alertSettings.email_notifications}
                  onCheckedChange={handleSwitchChange('email_notifications')}
                />
              </div>
              
              {alertSettings.email_notifications && (
                <div className="pt-2">
                  <Label htmlFor="email_address" className="text-sm mb-2 block">Email Address</Label>
                  <Input 
                    id="email_address" 
                    type="email" 
                    placeholder="your@email.com"
                    value={alertSettings.email_address || ''}
                    onChange={handleInputChange('email_address')}
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label htmlFor="push_notifications" className="text-base">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive alerts on your device</p>
                </div>
                <Switch 
                  id="push_notifications" 
                  checked={alertSettings.push_notifications}
                  onCheckedChange={handleSwitchChange('push_notifications')}
                />
              </div>
              
              <div className="pt-2">
                <Label htmlFor="notification_sound" className="text-sm mb-2 block">Notification Sound</Label>
                <Select 
                  value={alertSettings.notification_sound} 
                  onValueChange={handleSelectChange('notification_sound')}
                >
                  <SelectTrigger id="notification_sound">
                    <SelectValue placeholder="Select a sound" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="chime">Chime</SelectItem>
                    <SelectItem value="bell">Bell</SelectItem>
                    <SelectItem value="alert">Alert</SelectItem>
                    <SelectItem value="none">None (Silent)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cameras" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Camera-specific Alert Settings</CardTitle>
              <CardDescription>Configure alert sensitivity for each camera</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="camera-select" className="text-sm mb-2 block">Select Camera</Label>
                  <Select 
                    value={selectedCameraId || ''} 
                    onValueChange={(value) => setSelectedCameraId(value)}
                  >
                    <SelectTrigger id="camera-select">
                      <SelectValue placeholder="Select a camera" />
                    </SelectTrigger>
                    <SelectContent>
                      {cameras.map(camera => (
                        <SelectItem key={camera.id} value={camera.id}>
                          {camera.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedCameraId && (
                  <div>
                    <Label htmlFor="alert-level" className="text-sm mb-2 block">Alert Sensitivity</Label>
                    <Select 
                      value={alertLevel} 
                      onValueChange={(value) => setAlertLevel(value as 'low' | 'medium' | 'high' | 'none')}
                    >
                      <SelectTrigger id="alert-level">
                        <SelectValue placeholder="Select sensitivity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High - Alert on any motion</SelectItem>
                        <SelectItem value="medium">Medium - Standard sensitivity</SelectItem>
                        <SelectItem value="low">Low - Only major movements</SelectItem>
                        <SelectItem value="none">None - Disable alerts</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      onClick={handleSaveAlertLevel}
                      className="mt-4"
                      variant="secondary"
                      size="sm"
                    >
                      Save Camera Settings
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button 
          onClick={onSaveSettings}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Alert Settings'}
        </Button>
      </div>
    </div>
  );
};

export default AlertSettingsTab;
