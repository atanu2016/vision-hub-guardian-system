
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Camera } from "@/types/camera";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  error: string | null;
  camera: Camera;
  onRetry: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, camera, onRetry }) => {
  if (!error) return null;
  
  const getErrorContent = () => {
    if (error.includes("offline")) {
      return {
        title: "Camera Offline",
        message: "The camera is currently not accessible. Please check your network connection and camera power."
      };
    }
    
    if (camera.connectionType === 'rtsp' && camera.rtspUrl) {
      return {
        title: "Stream Unavailable",
        message: "RTSP stream could not be loaded. Please check your connection settings and ensure the camera supports RTSP."
      };
    }
    
    return {
      title: "Stream Error",
      message: error || "An unknown error occurred while trying to connect to the camera stream."
    };
  };
  
  const { title, message } = getErrorContent();
  
  return (
    <div className="absolute inset-0 bg-vision-dark-900/80 text-white flex flex-col items-center justify-center p-4 text-center">
      <AlertTriangle className="h-12 w-12 text-yellow-500 mb-2" />
      <h3 className="text-lg font-bold mb-1">{title}</h3>
      <p className="mb-4 text-sm text-gray-300 max-w-md">{message}</p>
      <Button 
        variant="outline"
        className="bg-vision-dark-700 border-vision-dark-600 hover:bg-vision-dark-600 text-white flex items-center gap-1"
        onClick={onRetry}
      >
        <RefreshCw className="h-4 w-4 mr-1" /> Retry Connection
      </Button>
    </div>
  );
};
