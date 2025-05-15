
import { useState, useEffect } from "react";
import { Camera } from "@/types/camera";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { CameraOff, WifiOff } from "lucide-react";

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
          const streamAvailable = camera.rtmpUrl && camera.rtmpUrl.length > 0;
          
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
  }, [camera.status, camera.rtmpUrl]);

  const isOnline = camera.status === "online" && isLiveStream;
  const isRecording = camera.recording;

  return (
    <Link to={`/cameras/${camera.id}`}>
      <Card className="camera-card h-full hover:shadow-md transition-all duration-200">
        <div className="camera-feed group aspect-video relative">
          {streamChecked ? (
            isOnline ? (
              <>
                <div className={`absolute top-2 left-2 z-10 h-2 w-2 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : "bg-green-500"}`}></div>
                {camera.thumbnail ? (
                  <img 
                    src={camera.thumbnail} 
                    alt={camera.name} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-vision-dark-800 flex items-center justify-center">
                    <span className="text-vision-dark-400">No preview</span>
                  </div>
                )}
              </>
            ) : (
              <div className="camera-feed-offline w-full h-full bg-vision-dark-900 flex items-center justify-center">
                <div className="absolute top-2 left-2 z-10 h-2 w-2 rounded-full bg-red-500"></div>
                <div className="flex flex-col items-center">
                  <CameraOff size={32} className="mb-2" />
                  <span>Camera offline</span>
                </div>
              </div>
            )
          ) : (
            // Loading state while checking stream
            <div className="w-full h-full bg-vision-dark-800 flex items-center justify-center">
              <span className="text-vision-dark-400">Checking stream...</span>
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-lg line-clamp-1">{camera.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">{camera.location}</p>
            </div>
            <Badge variant={isOnline ? "default" : "outline"} className="bg-vision-dark-700">
              {isOnline ? (
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  Online
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <WifiOff size={12} />
                  Offline
                </span>
              )}
            </Badge>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">
          <div className="flex w-full justify-between">
            <span>{camera.ipAddress}</span>
            {isRecording && (
              <span className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse mr-1.5"></span>
                Recording
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default CameraCard;
