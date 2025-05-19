
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Download, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { formatDuration } from "@/hooks/useRecordings";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface RecordingItemProps {
  id: string;
  cameraName: string;
  date: string;
  time: string;
  duration: number;
  fileSize: string;
  type: "Scheduled" | "Motion" | "Manual";
  important: boolean;
  onDelete?: (id: string) => Promise<void>;
}

export default function RecordingListItem({
  id,
  cameraName,
  date,
  time,
  duration,
  fileSize,
  type,
  important,
  onDelete
}: RecordingItemProps) {
  const [isPlayDialogOpen, setIsPlayDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Video source would typically come from a server storing the recordings
  // This is a mock video source for development purposes
  const videoSource = "https://media.istockphoto.com/id/1360942429/video/automated-parking-garage-for-car-storage-parking-car-storage-retrieval-system-car-storage.mp4?s=mp4-640x640-is&k=20&c=e5vRcQnXYE_L-tV0GpUzHU50DMoJrqkEVZmN7ViJ8GE=";
  
  // Function to handle video download
  const handleDownload = () => {
    // In a real implementation, this would trigger a download from your server
    const link = document.createElement('a');
    link.href = videoSource;
    link.download = `${cameraName}_${date}_${time.replace(/:/g, '-')}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Download started', {
      description: `Downloading recording from ${cameraName}`
    });
  };
  
  // Function to handle video deletion
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      if (onDelete) {
        await onDelete(id);
      }
      
      toast.success('Recording deleted', {
        description: `Successfully deleted recording from ${cameraName}`
      });
      
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting recording:', error);
      toast.error('Failed to delete recording', {
        description: 'Please try again later'
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div 
      key={id}
      className="bg-secondary/25 rounded-lg p-4 flex flex-col sm:flex-row gap-4 border border-border"
    >
      <div className="relative w-full sm:w-[140px] cursor-pointer" onClick={() => setIsPlayDialogOpen(true)}>
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
          <Button size="sm" variant="outline" onClick={() => setIsPlayDialogOpen(true)}>
            <Play className="mr-1 h-4 w-4" />
            Play
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownload}>
            <Download className="mr-1 h-4 w-4" />
            Download
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-red-500 hover:text-red-600"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </div>
      
      {/* Video Playback Dialog */}
      <Dialog open={isPlayDialogOpen} onOpenChange={setIsPlayDialogOpen}>
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
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recording</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this recording? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Recording'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
