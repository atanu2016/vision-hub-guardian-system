
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecordingCalendarProps } from "./calendar/types";
import { useRecordingCalendar } from "./calendar/useRecordingCalendar";
import CalendarDatePicker from "./calendar/CalendarDatePicker";
import TimeframeSelector from "./calendar/TimeframeSelector";
import RecordingsByDate from "./calendar/RecordingsByDate";

export default function RecordingCalendar({ cameraId }: RecordingCalendarProps) {
  const {
    date,
    isLoading,
    selectedDateRecordings,
    selectedTimeframe,
    setSelectedTimeframe,
    handleDateSelect
  } = useRecordingCalendar(cameraId);

  return (
    <Card className="border rounded-md">
      <CardHeader className="pb-3">
        <CardTitle>Recording History</CardTitle>
        <CardDescription>View and manage your recordings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <CalendarDatePicker 
            date={date} 
            onSelect={handleDateSelect} 
          />
          
          <div>
            <TimeframeSelector 
              selectedTimeframe={selectedTimeframe}
              setSelectedTimeframe={setSelectedTimeframe}
            />
            
            {date ? (
              <RecordingsByDate 
                isLoading={isLoading}
                selectedDateRecordings={selectedDateRecordings}
                selectedTimeframe={selectedTimeframe}
              />
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
