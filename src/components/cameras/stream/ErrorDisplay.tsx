
import React from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "@/types/camera";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorDisplayProps {
  error: string | null;
  camera: Camera;
  onRetry: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, camera, onRetry }) => {
  if (!error) return null;
  
  // Determine if we should show ONVIF-specific error guidance
  const isONVIFError = camera.connectionType === 'onvif' && (
    error.includes('unavailable') || 
    error.includes('failed') || 
    error.includes('Connection')
  );
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-vision-dark-900/70">
      <div className="text-center max-w-sm px-6 py-4 bg-black/40 rounded-lg backdrop-blur-sm">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-lg font-medium mb-2">{error}</p>
        
        <p className="text-sm text-muted-foreground mb-4">
          {camera.status === 'offline' ? 
            "The camera is offline. Please check the camera's power and network connection." : 
            "The camera stream is currently unavailable. Please check your connection settings."
          }
        </p>
        
        {isONVIFError && (
          <div className="text-xs text-muted-foreground mb-4 text-left bg-black/30 p-3 rounded">
            <p className="font-medium mb-1">Common ONVIF issues:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Incorrect username or password</li>
              <li>Firewall blocking connection</li>
              <li>Wrong ONVIF port (try port 80, 8000, or 8080)</li>
              <li>ONVIF not enabled on camera</li>
              <li>Consider using RTSP URL directly instead</li>
            </ul>
          </div>
        )}
        
        <Button 
          className="mt-2 w-full" 
          variant="outline" 
          onClick={onRetry}
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Connection
        </Button>
      </div>
    </div>
  );
};
