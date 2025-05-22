
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DebugTab } from "@/components/settings/advanced/DebugTab";
import GeneralTab from "@/components/settings/advanced/GeneralTab";
import { SecurityTab } from "@/components/settings/advanced/SecurityTab";
import DebugLogDialog from "@/components/settings/DebugLogDialog";

const AdvancedSettings = () => {
  const [isDebugLogOpen, setIsDebugLogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Advanced Settings</h1>
        <p className="text-muted-foreground">
          Configure system-level settings and debug options
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="debug">Debug</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-4">
          <GeneralTab />
        </TabsContent>
        <TabsContent value="security" className="space-y-4">
          <SecurityTab />
        </TabsContent>
        <TabsContent value="debug" className="space-y-4">
          <DebugTab onOpenDebugLog={() => setIsDebugLogOpen(true)} />
        </TabsContent>
      </Tabs>

      <DebugLogDialog open={isDebugLogOpen} onOpenChange={setIsDebugLogOpen} />
    </div>
  );
};

export default AdvancedSettings;
