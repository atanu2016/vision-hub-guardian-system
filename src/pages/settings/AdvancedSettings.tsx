
import AppLayout from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GeneralTab from "@/components/settings/advanced/GeneralTab";
import { SecurityTab } from "@/components/settings/advanced/SecurityTab";
import { DebugTab } from "@/components/settings/advanced/DebugTab";
import { useState } from "react";
import { toast } from "sonner";

const AdvancedSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDebugLogOpen, setIsDebugLogOpen] = useState(false);
  
  const handleSaveSettings = async (settings: any) => {
    setIsLoading(true);
    try {
      // Simulate a save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Settings saved successfully");
      return true;
    } catch (error) {
      toast.error("Failed to save settings");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDebugLog = () => {
    setIsDebugLogOpen(true);
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Advanced Settings</h2>
          <p className="text-muted-foreground">
            Configure advanced system settings and debugging options.
          </p>
        </div>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="debug">Debug</TabsTrigger>
              </TabsList>
              <TabsContent value="general" className="pt-6 w-full">
                <GeneralTab 
                  onSave={handleSaveSettings}
                  settings={{
                    serverPort: "8080",
                    logLevel: "info",
                    logRetentionDays: 30
                  }}
                  loading={isLoading}
                />
              </TabsContent>
              <TabsContent value="security" className="pt-6 w-full">
                <SecurityTab />
              </TabsContent>
              <TabsContent value="debug" className="pt-6 w-full">
                <DebugTab onOpenDebugLog={handleOpenDebugLog} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AdvancedSettings;
