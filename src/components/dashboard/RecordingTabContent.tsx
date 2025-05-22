
import { Skeleton } from "@/components/ui/skeleton";
import RecordingCard from "@/components/dashboard/RecordingCard";
import { Recording } from "@/hooks/recordings/types";

interface RecordingTabContentProps {
  loading: boolean;
  recordings: Recording[];
}

const RecordingTabContent = ({ loading, recordings }: RecordingTabContentProps) => {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-48 w-full rounded-md" />
        <Skeleton className="h-48 w-full rounded-md" />
        <Skeleton className="h-48 w-full rounded-md" />
      </div>
    );
  }

  if (recordings.length === 0) {
    return <div className="col-span-3 text-center">No recordings found.</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {recordings.slice(0, 6).map((recording) => (
        <RecordingCard key={recording.id} recording={recording} />
      ))}
    </div>
  );
};

export default RecordingTabContent;
