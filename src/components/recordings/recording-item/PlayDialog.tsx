
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { formatDuration } from "@/hooks/useRecordings";
import { format } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface PlayDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cameraName: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  videoSource: string;
  onDownload: () => void;
}

export default function PlayDialog({
  isOpen,
  onOpenChange,
  cameraName,
  date,
  time,
  duration,
  type,
  videoSource,
  onDownload
}: PlayDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{cameraName} - {format(new Date(`${date}T${time}`), "MMM dd, yyyy")} {time}</DialogTitle>
          <DialogDescription>
            {type} recording - {formatDuration(duration)}
          </DialogDescription>
        </DialogHeader>
        
        <AspectRatio ratio={16/9}>
          <video 
            className="w-full h-full rounded-md" 
            controls 
            autoPlay
            src={videoSource}
          />
        </AspectRatio>
        
        <DialogFooter>
          <Button variant="outline" onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
