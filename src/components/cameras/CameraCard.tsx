
import { Camera } from "@/types/camera";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { CameraOff, WifiOff } from "lucide-react";

interface CameraCardProps {
  camera: Camera;
}

const CameraCard = ({ camera }: CameraCardProps) => {
  const isOnline = camera.status === "online";
  const isRecording = camera.recording;

  return (
    <Link to={`/cameras/${camera.id}`}>
      <Card className="camera-card h-full">
        <div className="camera-feed group">
          {isOnline ? (
            <>
              <div className={`status-indicator ${isRecording ? "status-recording" : "status-online"}`}></div>
              {camera.thumbnail ? (
                <img 
                  src={camera.thumbnail} 
                  alt={camera.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-vision-dark-800 flex items-center justify-center">
                  <span className="text-vision-dark-400">No preview</span>
                </div>
              )}
            </>
          ) : (
            <div className="camera-feed-offline">
              <div className="status-indicator status-offline"></div>
              <div className="flex flex-col items-center">
                <CameraOff size={32} className="mb-2" />
                <span>Camera offline</span>
              </div>
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
