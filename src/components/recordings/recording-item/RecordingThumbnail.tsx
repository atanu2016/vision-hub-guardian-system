
import { Play } from "lucide-react";

interface RecordingThumbnailProps {
  onClick: () => void;
}

export default function RecordingThumbnail({ onClick }: RecordingThumbnailProps) {
  return (
    <div className="relative w-full sm:w-[140px] cursor-pointer" onClick={onClick}>
      <div className="aspect-video bg-vision-dark-900 rounded overflow-hidden flex items-center justify-center">
        <Play className="h-8 w-8 text-muted-foreground" />
      </div>
    </div>
  );
}
