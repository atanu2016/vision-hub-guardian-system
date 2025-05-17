
import { format } from "date-fns";
import RecordingListItem from "./RecordingListItem";

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
}

export default function RecordingsList({ recordings, loading }: RecordingsListProps) {
  // Get the display date for the header
  const displayDate = recordings.length > 0 ? format(new Date(recordings[0].date), "MMM dd, yyyy") : "";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading recordings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{recordings.length} Recordings from {displayDate}</h2>
      
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
          />
        ))}
      </div>
    </div>
  );
}
