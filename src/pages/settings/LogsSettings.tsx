
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ApplicationLogs from './ApplicationLogs';
import SystemLogsViewer from '@/components/logs/SystemLogsViewer';

const LogsSettings = () => {
  const [activeTab, setActiveTab] = useState('application');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Logs</h1>
        <p className="text-muted-foreground">
          View and manage application and system logs for debugging and monitoring
        </p>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="application">Application Logs</TabsTrigger>
          <TabsTrigger value="system">System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="application" className="space-y-4">
          <ApplicationLogs />
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <SystemLogsViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LogsSettings;
