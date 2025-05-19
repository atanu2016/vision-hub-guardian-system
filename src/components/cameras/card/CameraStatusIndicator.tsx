
import React from "react";

interface CameraStatusIndicatorProps {
  isOnline: boolean;
  isRecording: boolean;
}

const CameraStatusIndicator: React.FC<CameraStatusIndicatorProps> = ({ isOnline, isRecording }) => {
  return (
    <div className={`absolute top-2 left-2 z-10 h-2 w-2 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : isOnline ? "bg-green-500" : "bg-red-500"}`}></div>
  );
};

export default CameraStatusIndicator;
