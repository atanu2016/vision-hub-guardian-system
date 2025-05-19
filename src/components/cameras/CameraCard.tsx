
import { useState, useEffect } from "react";
import { Camera } from "@/types/camera";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "react-router-dom";
import CameraStatusIndicator from "./card/CameraStatusIndicator";
import CameraThumbnail from "./card/CameraThumbnail";
import CameraInfo from "./card/CameraInfo";
import CameraFooter from "./card/CameraFooter";

interface CameraCardProps {
  camera: Camera;
  onDelete?: (cameraId: string) => Promise<void>;
}

const CameraCard = ({ camera, onDelete }: CameraCardProps) => {
  const [isLiveStream, setIsLiveStream] = useState(false);
  const [streamChecked, setStreamChecked] = useState(false);

  // Check if the camera stream is actually available
  useEffect(() => {
    if (camera.status === "online") {
      // In a real implementation, this would check if the stream is actually available
      const checkStreamAvailability = async () => {
        try {
          // This would be a real API call to check stream availability in production
          // For now we'll simulate an API call with a timeout
          const streamAvailable = Boolean(camera.rtmpUrl?.length > 0 || camera.hlsUrl?.length > 0);
          
          // Set stream status based on actual availability
          setIsLiveStream(streamAvailable);
          setStreamChecked(true);
        } catch (error) {
          console.error("Failed to check stream availability:", error);
          setIsLiveStream(false);
          setStreamChecked(true);
        }
      };
      
      // Start the check
      checkStreamAvailability();
    } else {
      setIsLiveStream(false);
      setStreamChecked(true);
    }
  }, [camera.status, camera.rtmpUrl, camera.hlsUrl]);

  const isOnline = camera.status === "online" && isLiveStream;
  const isRecording = camera.recording;

  return (
    <Link to={`/cameras/${camera.id}`}>
      <Card className="camera-card h-full hover:shadow-md transition-all duration-200">
        <div className="camera-feed group aspect-video relative">
          <CameraStatusIndicator isOnline={isOnline} isRecording={isRecording} />
          <CameraThumbnail 
            thumbnail={camera.thumbnail} 
            isOnline={isOnline} 
            streamChecked={streamChecked} 
          />
        </div>
        
        <CardContent className="p-4">
          <CameraInfo 
            name={camera.name} 
            location={camera.location} 
            isOnline={isOnline} 
          />
        </CardContent>
        
        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">
          <CameraFooter 
            ipAddress={camera.ipAddress} 
            isRecording={isRecording} 
          />
        </CardFooter>
      </Card>
    </Link>
  );
};

export default CameraCard;
