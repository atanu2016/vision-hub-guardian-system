
import { format } from "date-fns";
import RecordingListItem from "./RecordingListItem";
import { Skeleton } from "@/components/ui/skeleton";

interface Recording {
  id: string;
  cameraName: string;
  date: string;
  time: string;
  duration: number;
  fileSize: string;
  type: "Scheduled" | "Motion" | "Manual";
  important: boolean;
  thumbnailUrl?: string;
}

interface RecordingsListProps {
  recordings: Recording[];
  loading: boolean;
  onDeleteRecording?: (id: string) => Promise<void>;
  dateFilter?: Date | null;
}

export default function RecordingsList({ 
  recordings, 
  loading, 
  onDeleteRecording,
  dateFilter 
}: RecordingsListProps) {
  // Get the display date for the header
  const displayDate = dateFilter 
    ? format(dateFilter, "MMM dd, yyyy")
    : recordings.length > 0 
      ? format(new Date(recordings[0].date), "MMM dd, yyyy") 
      : "";

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Loading recordings...</h2>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-secondary/25 rounded-lg p-4 flex flex-col sm:flex-row gap-4 border border-border">
            <Skeleton className="h-[90px] w-[140px] rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (recordings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center p-8 border border-dashed rounded-lg">
        <h3 className="text-lg font-medium mb-2">No recordings found</h3>
        <p className="text-muted-foreground mb-6">
          {dateFilter 
            ? `No recordings are available for ${format(dateFilter, "MMMM d, yyyy")}`
            : "Try selecting a different camera or recording type"}
        </p>
        {dateFilter && (
          <p className="text-sm text-muted-foreground">
            Try selecting a different date or clear the date filter
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">
        {recordings.length} Recordings
        {displayDate && <span> from {displayDate}</span>}
      </h2>
      
      <div className="space-y-4">
        {recordings.map(recording => (
          <RecordingListItem 
            key={recording.id}
            id={recording.id}
            cameraName={recording.cameraName}
            date={recording.date}
            time={recording.time}
            duration={recording.duration}
            fileSize={recording.fileSize}
            type={recording.type}
            important={recording.important}
            onDelete={onDeleteRecording}
          />
        ))}
      </div>
    </div>
  );
}
