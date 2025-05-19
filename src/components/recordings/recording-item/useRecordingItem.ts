
import { useState } from "react";
import { toast } from "sonner";

interface UseRecordingItemProps {
  id: string;
  cameraName: string;
  onDelete?: (id: string) => Promise<void>;
}

export const useRecordingItem = ({ id, cameraName, onDelete }: UseRecordingItemProps) => {
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
    link.download = `${cameraName}_${id}.mp4`;
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

  return {
    isPlayDialogOpen,
    setIsPlayDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeleting,
    videoSource,
    handleDownload,
    handleDelete
  };
};
