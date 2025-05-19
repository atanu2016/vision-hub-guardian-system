
import { Button } from "@/components/ui/button";
import { Play, Download, Trash2 } from "lucide-react";

interface RecordingActionsProps {
  onPlay: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

export default function RecordingActions({
  onPlay,
  onDownload,
  onDelete
}: RecordingActionsProps) {
  return (
    <div className="flex gap-2 mt-2 sm:mt-0">
      <Button size="sm" variant="outline" onClick={onPlay}>
        <Play className="mr-1 h-4 w-4" />
        Play
      </Button>
      <Button size="sm" variant="outline" onClick={onDownload}>
        <Download className="mr-1 h-4 w-4" />
        Download
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        className="text-red-500 hover:text-red-600"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete</span>
      </Button>
    </div>
  );
}
