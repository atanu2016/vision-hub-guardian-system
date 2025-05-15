
import React from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "@/types/camera";

interface ErrorDisplayProps {
  error: string | null;
  camera: Camera;
  onRetry: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, camera, onRetry }) => {
  if (!error) return null;
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-vision-dark-900/70">
      <div className="text-center max-w-xs px-4">
        <p className="text-lg font-medium mb-2">{error}</p>
        <p className="text-sm text-muted-foreground">
          The camera stream is currently unavailable. 
          {camera.status === 'offline' ? " The camera is offline." : " Please try again later."}
        </p>
        <Button className="mt-4" variant="outline" onClick={onRetry}>
          Retry Connection
        </Button>
      </div>
    </div>
  );
};
