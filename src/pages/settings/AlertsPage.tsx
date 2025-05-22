
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AlertSettingsTab from "@/components/settings/alerts/AlertSettingsTab";
import AlertTypes from "@/components/settings/alerts/AlertTypes";
import CameraSpecificAlerts from "@/components/settings/alerts/CameraSpecificAlerts";
import AlertHistory from "@/components/settings/alerts/AlertHistory";
import NotificationSettings from "@/components/settings/alerts/NotificationSettings";
import { useAlertSettings } from '@/hooks/useAlertSettings';

const AlertsPage = () => {
  const [activeTab, setActiveTab] = useState("general");
  const { 
    settings,
    cameras,
    loading, 
    saving,
    updateAlertSettings,
    handleSaveSettings,
    handleCameraAlertLevelChange
  } = useAlertSettings();

  // Create a wrapper function to adapt the level parameter types
  const handleAlertLevelChange = (cameraId: string, level: "low" | "medium" | "high" | "none") => {
    // Map "none" to "off" if needed
    const adaptedLevel = level === "none" ? "off" : level;
    return handleCameraAlertLevelChange(cameraId, adaptedLevel as "off" | "low" | "medium" | "high");
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Alert Settings</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Configure Alerts & Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="types">Alert Types</TabsTrigger>
              <TabsTrigger value="cameras">Camera Alerts</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="history">Alert History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4">
              <AlertSettingsTab 
                alertSettings={settings}
                cameras={cameras}
                saving={saving}
                onSettingsChange={updateAlertSettings}
                onSaveSettings={handleSaveSettings}
                onCameraAlertLevelChange={handleAlertLevelChange}
              />
            </TabsContent>
            
            <TabsContent value="types" className="space-y-4">
              <AlertTypes 
                motionDetection={settings.motion_detection}
                cameraOffline={settings.camera_offline}
                storageWarning={settings.storage_warning}
                onMotionChange={(checked) => updateAlertSettings({ motion_detection: checked })}
                onOfflineChange={(checked) => updateAlertSettings({ camera_offline: checked })}
                onStorageChange={(checked) => updateAlertSettings({ storage_warning: checked })}
              />
            </TabsContent>
            
            <TabsContent value="cameras" className="space-y-4">
              <CameraSpecificAlerts 
                cameras={cameras}
                onAlertLevelChange={handleAlertLevelChange} 
              />
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-4">
              <NotificationSettings
                emailNotifications={settings.email_notifications}
                pushNotifications={settings.push_notifications}
                emailAddress={settings.email_address || ''}
                notificationSound={settings.notification_sound || 'default'}
                onEmailToggle={(checked) => updateAlertSettings({ email_notifications: checked })}
                onPushToggle={(checked) => updateAlertSettings({ push_notifications: checked })}
                onEmailChange={(email) => updateAlertSettings({ email_address: email })}
                onSoundChange={(sound) => updateAlertSettings({ notification_sound: sound })}
              />
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4">
              <AlertHistory />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertsPage;
