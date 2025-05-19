
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

// Define a simple record type completely separate from Supabase types
interface SimpleRecording {
  id: string;
  time: string;
  duration: number;
  type: string;
  file_size: string;
  date: string;
}

const CameraTabs = ({ cameraId }: { cameraId?: string }) => {
  const [recordings, setRecordings] = useState<SimpleRecording[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (cameraId) {
      loadRecordings(cameraId);
    }
  }, [cameraId]);

  const loadRecordings = async (cameraId: string) => {
    setIsLoading(true);
    try {
      // Use any type for data to avoid TypeScript recursion issues
      const { data, error } = await supabase
        .from('recordings')
        .select('id, time, duration, type, file_size, date')
        .eq('camera_id', cameraId)
        .order('date_time', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Manually map to our safe interface to avoid type inference issues
      const safeData: SimpleRecording[] = [];
      if (data) {
        for (const item of data) {
          safeData.push({
            id: item.id,
            time: item.time,
            duration: item.duration,
            type: item.type,
            file_size: item.file_size,
            date: item.date
          });
        }
      }
      
      setRecordings(safeData);
    } catch (error) {
      console.error('Error loading camera recordings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs defaultValue="recordings" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="recordings">Recordings</TabsTrigger>
        <TabsTrigger value="events">Events</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>
      <TabsContent value="recordings" className="border rounded-md p-4 mt-2">
        {cameraId ? (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Recent Recordings</h3>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : recordings.length > 0 ? (
              <div className="space-y-2">
                {recordings.map((recording) => (
                  <div 
                    key={recording.id} 
                    className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {format(new Date(recording.date), 'MMM dd')} at {recording.time}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Duration: {recording.duration} min · Size: {recording.file_size}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                        {recording.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8">
                <h3 className="text-lg font-medium mb-2">No recordings found</h3>
                <p className="text-muted-foreground">
                  This camera has no recordings yet
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-8">
            <h3 className="text-lg font-medium mb-2">No camera selected</h3>
            <p className="text-muted-foreground">Select a camera to view recordings</p>
          </div>
        )}
      </TabsContent>
      <TabsContent value="events" className="border rounded-md p-4 mt-2">
        <div className="text-center p-8">
          <h3 className="text-lg font-medium mb-2">No events detected</h3>
          <p className="text-muted-foreground">Events will appear here when detected</p>
        </div>
      </TabsContent>
      <TabsContent value="analytics" className="border rounded-md p-4 mt-2">
        <div className="text-center p-8">
          <h3 className="text-lg font-medium mb-2">Analytics not available</h3>
          <p className="text-muted-foreground">
            Enable analytics in settings to view data
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default CameraTabs;
