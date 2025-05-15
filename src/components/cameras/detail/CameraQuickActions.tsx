
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Camera } from "@/types/camera";
import { useToast } from "@/hooks/use-toast";
import { saveCamera } from "@/services/apiService";

interface CameraQuickActionsProps {
  camera: Camera;
  onCameraUpdate: (updatedCamera: Camera) => void;
  onDeleteClick: () => void;
  onSettingsClick: () => void;
}

const CameraQuickActions = ({ 
  camera, 
  onCameraUpdate, 
  onDeleteClick,
  onSettingsClick
}: CameraQuickActionsProps) => {
  const { toast } = useToast();
  const isOnline = camera.status === "online";
  
  const handleFullScreen = () => {
    const videoElement = document.querySelector('video');
    if (videoElement) {
      if (videoElement.requestFullscreen) {
        videoElement.requestFullscreen();
      } 
    } else {
      toast({
        title: "Error",
        description: "Unable to enter full screen mode."
      });
    }
  };
  
  const toggleRecording = () => {
    const updatedCamera = {
      ...camera,
      recording: !camera.recording
    };
    
    onCameraUpdate(updatedCamera);
    saveCamera(updatedCamera).then(() => {
      toast({
        title: updatedCamera.recording ? "Recording started" : "Recording stopped",
        description: updatedCamera.recording ? 
          "Camera has started recording." : 
          "Camera recording has been stopped."
      });
    });
  };
  
  return (
    <div className="border rounded-md p-4">
      <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
      <div className="space-y-2">
        <Button 
          className="w-full" 
          variant="outline"
          onClick={handleFullScreen}
          disabled={!isOnline}
        >
          View Full Screen
        </Button>
        <Button 
          className="w-full" 
          variant="outline"
          onClick={toggleRecording}
          disabled={!isOnline}
        >
          {camera.recording ? "Stop Recording" : "Begin Recording"}
        </Button>
        <Button 
          className="w-full" 
          variant="outline"
          onClick={onSettingsClick}
        >
          Configure Camera Settings
        </Button>
        <Button 
          className="w-full" 
          variant="destructive"
          onClick={onDeleteClick}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete Camera
        </Button>
      </div>
    </div>
  );
};

export default CameraQuickActions;
