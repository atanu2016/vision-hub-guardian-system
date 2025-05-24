
import { AlertTriangle, RefreshCw, Settings, Wifi } from "lucide-react";
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
        message: "The camera is currently not accessible. Please check your network connection and camera power.",
        icon: <Wifi className="h-12 w-12 text-red-500 mb-2" />,
        suggestions: [
          "Verify camera power supply is connected",
          "Check network cable connections", 
          "Confirm camera IP address is reachable",
          "Ensure camera is on the same network"
        ]
      };
    }
    
    if (error.includes("RTSP") || camera.connectionType === 'rtsp') {
      return {
        title: "RTSP Stream Error",
        message: "Unable to connect to RTSP stream. Please verify your connection settings.",
        icon: <AlertTriangle className="h-12 w-12 text-yellow-500 mb-2" />,
        suggestions: [
          "Check RTSP URL format (rtsp://username:password@ip:554/path)",
          "Verify camera credentials are correct",
          "Ensure RTSP is enabled in camera settings",
          "Try different stream paths or ports"
        ]
      };
    }
    
    if (error.includes("ONVIF")) {
      return {
        title: "ONVIF Connection Error", 
        message: "Cannot establish ONVIF connection to camera.",
        icon: <Settings className="h-12 w-12 text-blue-500 mb-2" />,
        suggestions: [
          "Verify ONVIF is enabled on camera",
          "Check camera IP address and port",
          "Confirm authentication credentials",
          "Try different ONVIF service path"
        ]
      };
    }
    
    return {
      title: "Stream Connection Error",
      message: error || "An unknown error occurred while trying to connect to the camera stream.",
      icon: <AlertTriangle className="h-12 w-12 text-orange-500 mb-2" />,
      suggestions: [
        "Check camera connection settings",
        "Verify network connectivity", 
        "Try refreshing the page",
        "Contact administrator if issue persists"
      ]
    };
  };
  
  const { title, message, icon, suggestions } = getErrorContent();
  
  return (
    <div className="absolute inset-0 bg-vision-dark-900/90 text-white flex flex-col items-center justify-center p-6 text-center">
      {icon}
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="mb-4 text-sm text-gray-300 max-w-md leading-relaxed">{message}</p>
      
      <div className="mb-6 text-left bg-vision-dark-800 p-4 rounded-lg max-w-md">
        <h4 className="text-sm font-semibold mb-2 text-yellow-400">Troubleshooting Tips:</h4>
        <ul className="text-xs text-gray-300 space-y-1">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start">
              <span className="text-yellow-400 mr-2">•</span>
              {suggestion}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline"
          className="bg-vision-dark-700 border-vision-dark-600 hover:bg-vision-dark-600 text-white flex items-center gap-2"
          onClick={onRetry}
        >
          <RefreshCw className="h-4 w-4" /> Retry Connection
        </Button>
      </div>
      
      <p className="text-xs text-gray-400 mt-4">
        Camera: {camera.name} ({camera.connectionType?.toUpperCase()})
      </p>
    </div>
  );
};
