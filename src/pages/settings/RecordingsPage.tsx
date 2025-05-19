
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRecordingSettings } from '@/hooks/useRecordingSettings';
import GeneralRecordingSettings from '@/components/recordings/settings/GeneralRecordingSettings';
import SchedulesContent from '@/components/recordings/settings/SchedulesContent';
import { Button } from "@/components/ui/button";
import { CalendarIcon, List } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export default function RecordingsPage() {
  const { activeTab, setActiveTab } = useRecordingSettings();
  const navigate = useNavigate();

  const handleViewAllRecordings = () => {
    navigate('/recordings');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Recording Settings</h1>
        <p className="text-muted-foreground">
          Configure when and how cameras should record footage
        </p>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
          <TabsTrigger value="settings">Recording Settings</TabsTrigger>
          <TabsTrigger value="schedules">Recording Schedules</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings" className="mt-4">
          <GeneralRecordingSettings />
        </TabsContent>
        
        <TabsContent value="schedules" className="mt-4">
          <SchedulesContent />
        </TabsContent>
      </Tabs>
      
      <div className="flex flex-col space-y-2 p-6 bg-card border rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Recording History</h2>
        <p className="text-muted-foreground mb-6">
          View and manage your recording history, including all recorded footage from your cameras
        </p>
        
        <div className="flex gap-4 mt-2">
          <Button 
            onClick={handleViewAllRecordings} 
            className="gap-2"
          >
            <List className="h-4 w-4" />
            View All Recordings
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/recordings?view=calendar')}
            className="gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            Calendar View
          </Button>
        </div>
      </div>
    </div>
  );
}
