
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, CalendarIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

// Define the props
interface RecordingCalendarProps {
  cameraId?: string;
}

export default function RecordingCalendar({ cameraId }: RecordingCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [recordingDates, setRecordingDates] = useState<Date[]>([
    // Sample data for demonstration
    // In a real app, these would be loaded from the database
    new Date(2025, 4, 1),
    new Date(2025, 4, 3),
    new Date(2025, 4, 5),
    new Date(2025, 4, 7),
    new Date(2025, 4, 10),
    new Date(2025, 4, 12),
    new Date(2025, 4, 15),
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDateRecordings, setSelectedDateRecordings] = useState<any[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string | null>(null);

  const handleDateSelect = async (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (!selectedDate) return;
    
    setIsLoading(true);
    try {
      // In a real implementation, fetch recordings for this date from the database
      // For demonstration, we'll simulate a request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if the selected date is in our recording dates
      const hasRecordings = recordingDates.some(d => 
        d.getDate() === selectedDate.getDate() && 
        d.getMonth() === selectedDate.getMonth() && 
        d.getFullYear() === selectedDate.getFullYear()
      );
      
      if (hasRecordings) {
        // Generate mock recordings data
        const mockRecordings = [
          { id: '1', time: '08:30:00', duration: '00:15:32', motion: true, size: '45.2 MB' },
          { id: '2', time: '10:15:45', duration: '00:05:12', motion: true, size: '18.7 MB' },
          { id: '3', time: '13:45:22', duration: '00:30:00', motion: false, size: '87.3 MB' },
          { id: '4', time: '16:20:18', duration: '00:12:45', motion: true, size: '32.1 MB' },
          { id: '5', time: '19:10:05', duration: '00:08:33', motion: true, size: '24.8 MB' },
        ];
        
        setSelectedDateRecordings(mockRecordings);
      } else {
        setSelectedDateRecordings([]);
      }
      
      // In a real implementation, log this action
      if (cameraId) {
        await supabase.from('system_logs').insert({
          level: 'info',
          source: 'recordings',
          message: `Accessed recordings for date: ${format(selectedDate, 'yyyy-MM-dd')}`,
          details: `Accessed recordings for camera ${cameraId} on date ${format(selectedDate, 'yyyy-MM-dd')}`
        });
      }
    } catch (error) {
      console.error('Error loading recordings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  function isRecordingDate(date: Date) {
    return recordingDates.some(d => 
      d.getDate() === date.getDate() && 
      d.getMonth() === date.getMonth() && 
      d.getFullYear() === date.getFullYear()
    );
  }

  function renderDay(day: Date) {
    const isRecording = isRecordingDate(day);
    
    return (
      <div className="relative">
        <div 
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-md",
            isRecording && "after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-primary"
          )}
        >
          {day.getDate()}
          {isRecording && (
            <Check className="absolute right-1 bottom-1 h-3 w-3 text-primary" />
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="border rounded-md">
      <CardHeader className="pb-3">
        <CardTitle>Recording History</CardTitle>
        <CardDescription>View and manage your recordings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                initialFocus
                components={{
                  Day: renderDay  // Fixed: Changed 'day' to 'Day' (capitalized)
                }}
              />
            </PopoverContent>
          </Popover>
          
          <div>
            <div className="mb-2 flex items-center">
              <h4 className="text-sm font-semibold">Timeframe</h4>
              <div className="ml-2 flex gap-1">
                <Badge 
                  variant={selectedTimeframe === 'morning' ? "default" : "outline"} 
                  className="cursor-pointer"
                  onClick={() => setSelectedTimeframe('morning')}
                >
                  Morning
                </Badge>
                <Badge 
                  variant={selectedTimeframe === 'afternoon' ? "default" : "outline"} 
                  className="cursor-pointer"
                  onClick={() => setSelectedTimeframe('afternoon')}
                >
                  Afternoon
                </Badge>
                <Badge 
                  variant={selectedTimeframe === 'evening' ? "default" : "outline"} 
                  className="cursor-pointer"
                  onClick={() => setSelectedTimeframe('evening')}
                >
                  Evening
                </Badge>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : selectedDateRecordings.length > 0 ? (
              <div className="space-y-2">
                {selectedDateRecordings
                  .filter(recording => {
                    if (!selectedTimeframe) return true;
                    const hour = parseInt(recording.time.split(':')[0]);
                    switch (selectedTimeframe) {
                      case 'morning': return hour >= 5 && hour < 12;
                      case 'afternoon': return hour >= 12 && hour < 18;
                      case 'evening': return hour >= 18 || hour < 5;
                      default: return true;
                    }
                  })
                  .map(recording => (
                    <div 
                      key={recording.id} 
                      className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
                    >
                      <div>
                        <p className="text-sm font-medium">{recording.time}</p>
                        <p className="text-xs text-muted-foreground">
                          Duration: {recording.duration} • Size: {recording.size}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {recording.motion && (
                          <Badge variant="outline" className="mr-2">Motion</Badge>
                        )}
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                
                {selectedTimeframe && 
                  selectedDateRecordings.filter(recording => {
                    const hour = parseInt(recording.time.split(':')[0]);
                    switch (selectedTimeframe) {
                      case 'morning': return hour >= 5 && hour < 12;
                      case 'afternoon': return hour >= 12 && hour < 18;
                      case 'evening': return hour >= 18 || hour < 5;
                      default: return true;
                    }
                  }).length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No recordings found for this timeframe
                    </div>
                  )}
              </div>
            ) : date ? (
              <div className="text-center py-8 text-muted-foreground">
                No recordings available for this date
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a date to view recordings
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline">Export Recordings</Button>
      </CardFooter>
    </Card>
  );
}
