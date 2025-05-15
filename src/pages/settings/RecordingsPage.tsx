
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RecordingCalendar from '@/components/recordings/RecordingCalendar';

export default function RecordingsPage() {
  const [activeTab, setActiveTab] = useState('settings');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Recording Settings</h1>
        <p className="text-muted-foreground">
          Configure when and how cameras should record footage
        </p>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="settings">Recording Settings</TabsTrigger>
          <TabsTrigger value="schedules">Recording Schedules</TabsTrigger>
          <TabsTrigger value="history">Recording History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings">
          <div className="p-6 text-center">
            <p>Recording settings configuration will be implemented in a future update</p>
          </div>
        </TabsContent>
        
        <TabsContent value="schedules">
          <div className="p-6 text-center">
            <p>Recording schedules configuration will be implemented in a future update</p>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <RecordingCalendar />
        </TabsContent>
      </Tabs>
    </div>
  );
}
