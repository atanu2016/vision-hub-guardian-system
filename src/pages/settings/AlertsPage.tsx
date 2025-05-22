
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
    loading, 
    saving, 
    saveSettings
  } = useAlertSettings();

  // Placeholder handlers for camera alert level changes
  const handleCameraAlertLevelChange = (cameraId: string, level: "low" | "medium" | "high" | "none") => {
    // Convert "none" to "off" if needed by your implementation
    const adjustedLevel = level === "none" ? "off" : level;
    console.log(`Setting camera ${cameraId} alert level to ${adjustedLevel}`);
    // Here you would normally save this to state or directly to your API
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
                settings={settings}
                onSave={saveSettings}
                isLoading={loading || saving}
              />
            </TabsContent>
            
            <TabsContent value="types" className="space-y-4">
              <AlertTypes />
            </TabsContent>
            
            <TabsContent value="cameras" className="space-y-4">
              <CameraSpecificAlerts 
                onAlertLevelChange={handleCameraAlertLevelChange} 
              />
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-4">
              <NotificationSettings />
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
