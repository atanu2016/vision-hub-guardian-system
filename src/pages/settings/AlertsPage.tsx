
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAlertSettings } from "@/hooks/useAlertSettings";
import SMTPSettings from "@/components/settings/email/SMTPSettings";
import AlertSettingsTab from "@/components/settings/alerts/AlertSettingsTab";
import AlertHistory from "@/components/settings/alerts/AlertHistory";

const AlertsPage = () => {
  const [activeTab, setActiveTab] = useState("settings");
  const {
    settings,
    cameras,
    loading,
    saving,
    updateAlertSettings,
    handleSaveSettings,
    handleCameraAlertLevelChange
  } = useAlertSettings();

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">Loading alert settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Alert Settings</h1>
        <p className="text-muted-foreground">
          Configure alert notifications for your camera system
        </p>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="settings">Alert Settings</TabsTrigger>
          <TabsTrigger value="email">Email Configuration</TabsTrigger>
          <TabsTrigger value="history">Alert History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings" className="space-y-6 mt-6">
          <AlertSettingsTab 
            alertSettings={settings}
            cameras={cameras}
            saving={saving}
            onSettingsChange={updateAlertSettings}
            onSaveSettings={handleSaveSettings}
            onCameraAlertLevelChange={handleCameraAlertLevelChange}
          />
        </TabsContent>
        
        <TabsContent value="email" className="space-y-6 mt-6">
          <SMTPSettings />
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <AlertHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AlertsPage;
