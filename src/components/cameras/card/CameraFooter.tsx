
import React from "react";

interface CameraFooterProps {
  ipAddress: string;
  isRecording: boolean;
  isStreaming: boolean;
}

const CameraFooter: React.FC<CameraFooterProps> = ({ ipAddress, isRecording, isStreaming }) => {
  return (
    <div className="flex w-full justify-between">
      <span>{ipAddress}</span>
      <div className="flex items-center gap-2">
        {!isStreaming && (
          <span className="text-amber-500 text-xs">No stream</span>
        )}
        {isRecording && (
          <span className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse mr-1.5"></span>
            Recording
          </span>
        )}
      </div>
    </div>
  );
};

export default CameraFooter;
