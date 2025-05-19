
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/hooks/recordings/utils";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

interface RecordingMetadataProps {
  cameraName: string;
  date: string;
  time: string;
  duration: number; // Now expecting a number
  fileSize: string;
  type: "Scheduled" | "Motion" | "Manual";
  important: boolean;
}

export default function RecordingMetadata({
  cameraName,
  date,
  time,
  duration,
  fileSize,
  type,
  important
}: RecordingMetadataProps) {
  return (
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
  );
}
