
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RecordingCalendar from '@/components/recordings/RecordingCalendar';
import { useRecordingSettings } from '@/hooks/useRecordingSettings';
import GeneralRecordingSettings from '@/components/recordings/settings/GeneralRecordingSettings';
import SchedulesContent from '@/components/recordings/settings/SchedulesContent';

export default function RecordingsPage() {
  const { activeTab, setActiveTab } = useRecordingSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Recording Settings</h1>
        <p className="text-muted-foreground">
          Configure when and how cameras should record footage
        </p>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
          <TabsTrigger value="settings">Recording Settings</TabsTrigger>
          <TabsTrigger value="schedules">Recording Schedules</TabsTrigger>
          <TabsTrigger value="history">Recording History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings" className="mt-4">
          <GeneralRecordingSettings />
        </TabsContent>
        
        <TabsContent value="schedules" className="mt-4">
          <SchedulesContent />
        </TabsContent>
        
        <TabsContent value="history" className="mt-4">
          <RecordingCalendar />
        </TabsContent>
      </Tabs>
    </div>
  );
}
