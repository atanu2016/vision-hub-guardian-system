
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { RecordingsByDateProps } from "./types";

export default function RecordingsByDate({ 
  isLoading, 
  selectedDateRecordings, 
  selectedTimeframe 
}: RecordingsByDateProps) {
  // Filter recordings by timeframe
  const filteredRecordings = selectedDateRecordings.filter(recording => {
    if (!selectedTimeframe) return true;
    const hour = parseInt(recording.time.split(':')[0]);
    switch (selectedTimeframe) {
      case 'morning': return hour >= 5 && hour < 12;
      case 'afternoon': return hour >= 12 && hour < 18;
      case 'evening': return hour >= 18 || hour < 5;
      default: return true;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (selectedDateRecordings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No recordings available for this date
      </div>
    );
  }

  if (selectedTimeframe && filteredRecordings.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No recordings found for this timeframe
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filteredRecordings.map(recording => (
        <div 
          key={recording.id} 
          className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
        >
          <div>
            <p className="text-sm font-medium">{recording.time}</p>
            <p className="text-xs text-muted-foreground">
              Duration: {recording.duration} · Size: {recording.size}
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
    </div>
  );
}
