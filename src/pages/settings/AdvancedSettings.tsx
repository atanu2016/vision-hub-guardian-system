
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DebugLogDialog from '@/components/settings/DebugLogDialog';
import { GeneralTab } from '@/components/settings/advanced/GeneralTab';
import { SecurityTab } from '@/components/settings/advanced/SecurityTab';
import { DebugTab } from '@/components/settings/advanced/DebugTab';

export default function AdvancedSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [debugLogOpen, setDebugLogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Advanced Settings</h1>
        <p className="text-muted-foreground">
          Configure system security and advanced options
        </p>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="debugging">Debugging</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <GeneralTab />
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <SecurityTab />
        </TabsContent>
        
        <TabsContent value="debugging" className="space-y-6">
          <DebugTab onOpenDebugLog={() => setDebugLogOpen(true)} />
        </TabsContent>
      </Tabs>
      
      <DebugLogDialog open={debugLogOpen} onOpenChange={setDebugLogOpen} />
    </div>
  );
}
