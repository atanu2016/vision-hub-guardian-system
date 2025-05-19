
import React from "react";

interface CameraFooterProps {
  ipAddress: string;
  isRecording: boolean;
}

const CameraFooter: React.FC<CameraFooterProps> = ({ ipAddress, isRecording }) => {
  return (
    <div className="flex w-full justify-between">
      <span>{ipAddress}</span>
      {isRecording && (
        <span className="flex items-center">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse mr-1.5"></span>
          Recording
        </span>
      )}
    </div>
  );
};

export default CameraFooter;
