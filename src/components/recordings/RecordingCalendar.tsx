
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
    handleDateSelect,
    isRecordingDate
  } = useRecordingCalendar(cameraId);

  return (
    <Card className="border rounded-md shadow-sm">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
        <CardTitle className="text-xl text-blue-800 dark:text-blue-300">Recording History</CardTitle>
        <CardDescription>View and manage your security footage</CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="space-y-4">
          <CalendarDatePicker 
            date={date} 
            onSelect={handleDateSelect}
            hasRecordings={isRecordingDate}
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
              <div className="text-center py-8 text-muted-foreground bg-slate-50 dark:bg-slate-900/50 rounded-md">
                Select a date to view recordings
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
        <Button variant="outline" size="sm">Filter</Button>
        <Button variant="outline" size="sm">Export Recordings</Button>
      </CardFooter>
    </Card>
  );
}
