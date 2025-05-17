
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Play, Download, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { formatDuration } from "@/hooks/useRecordings";

interface RecordingItemProps {
  id: string;
  cameraName: string;
  date: string;
  time: string;
  duration: number;
  fileSize: string;
  type: "Scheduled" | "Motion" | "Manual";
  important: boolean;
}

export default function RecordingListItem({
  id,
  cameraName,
  date,
  time,
  duration,
  fileSize,
  type,
  important
}: RecordingItemProps) {
  return (
    <div 
      key={id}
      className="bg-secondary/25 rounded-lg p-4 flex flex-col sm:flex-row gap-4 border border-border"
    >
      <div className="relative w-full sm:w-[140px]">
        <div className="aspect-video bg-vision-dark-900 rounded overflow-hidden flex items-center justify-center">
          <Play className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>
      
      <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{cameraName}</h3>
            <Badge variant={type === "Motion" ? "default" : "outline"}>
              {type}
            </Badge>
            {important && (
              <Badge className="bg-green-700">Important</Badge>
            )}
          </div>
          
          <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{format(new Date(`${date}T${time}`), "MMM dd, yyyy")}</span>
            </div>
            <div>
              <span>{time}</span>
            </div>
            <div>
              <span>{formatDuration(duration)}</span>
            </div>
            <div>
              <span>{fileSize}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button size="sm" variant="outline">
            <Play className="mr-1 h-4 w-4" />
            Play
          </Button>
          <Button size="sm" variant="outline">
            <Download className="mr-1 h-4 w-4" />
            Download
          </Button>
          <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
