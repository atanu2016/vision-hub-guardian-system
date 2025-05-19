
import { Badge } from "@/components/ui/badge";
import { Camera } from "@/types/camera";

interface CameraStatusBadgesProps {
  camera: Camera;
  isStreaming?: boolean;
}

const CameraStatusBadges = ({ camera, isStreaming = false }: CameraStatusBadgesProps) => {
  const isOnline = camera.status === "online";
  // A camera is truly online only if both status is online AND streaming is available
  const isTrulyOnline = isOnline && isStreaming;
  
  return (
    <>
      <Badge variant={isTrulyOnline ? "default" : "outline"} className="ml-2">
        {isTrulyOnline ? "Online" : "Offline"}
      </Badge>
      {camera.recording && (
        <Badge variant="outline" className="bg-vision-dark-700 text-red-500">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
            Recording
          </span>
        </Badge>
      )}
    </>
  );
};

export default CameraStatusBadges;
