
import React from "react";

interface CameraStatusIndicatorProps {
  isOnline: boolean;
  isRecording: boolean;
  isStreaming: boolean;
}

const CameraStatusIndicator: React.FC<CameraStatusIndicatorProps> = ({ 
  isOnline, 
  isRecording, 
  isStreaming 
}) => {
  // A camera is truly online only if both status is online AND streaming is available
  const isTrulyOnline = isOnline && isStreaming;
  
  return (
    <div 
      className={`absolute top-2 left-2 z-10 h-2 w-2 rounded-full ${
        isRecording 
          ? "bg-red-500 animate-pulse" 
          : isTrulyOnline 
            ? "bg-green-500" 
            : "bg-red-500"
      }`}
      title={isRecording ? "Recording" : isTrulyOnline ? "Online" : "Offline"}
    />
  );
};

export default CameraStatusIndicator;
