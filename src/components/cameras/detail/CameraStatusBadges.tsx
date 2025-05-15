
import { Badge } from "@/components/ui/badge";
import { Camera } from "@/types/camera";

interface CameraStatusBadgesProps {
  camera: Camera;
}

const CameraStatusBadges = ({ camera }: CameraStatusBadgesProps) => {
  const isOnline = camera.status === "online";
  
  return (
    <>
      <Badge variant={isOnline ? "default" : "outline"} className="ml-2">
        {isOnline ? "Online" : "Offline"}
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
