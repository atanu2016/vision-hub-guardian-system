
import React from "react";
import { Badge } from "@/components/ui/badge";
import { WifiOff } from "lucide-react";

interface CameraInfoProps {
  name: string;
  location: string;
  isOnline: boolean;
  isStreaming: boolean;
}

const CameraInfo: React.FC<CameraInfoProps> = ({ name, location, isOnline, isStreaming }) => {
  // Camera is truly online only if both status is online AND streaming is available
  const isTrulyOnline = isOnline && isStreaming;
  
  return (
    <div className="flex items-start justify-between">
      <div>
        <h3 className="font-medium text-lg line-clamp-1">{name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-1">{location}</p>
      </div>
      <Badge variant={isTrulyOnline ? "default" : "outline"} className="bg-vision-dark-700">
        {isTrulyOnline ? (
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
  );
};

export default CameraInfo;
