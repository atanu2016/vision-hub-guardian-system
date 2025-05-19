
import React from "react";
import { CameraOff } from "lucide-react";

interface CameraThumbnailProps {
  thumbnail?: string;
  isOnline: boolean;
  streamChecked: boolean;
}

const CameraThumbnail: React.FC<CameraThumbnailProps> = ({ 
  thumbnail, 
  isOnline, 
  streamChecked 
}) => {
  if (!streamChecked) {
    return (
      <div className="w-full h-full bg-vision-dark-800 flex items-center justify-center">
        <span className="text-vision-dark-400">Checking stream...</span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="camera-feed-offline w-full h-full bg-vision-dark-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <CameraOff size={32} className="mb-2" />
          <span>Camera offline</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {thumbnail ? (
        <img 
          src={thumbnail} 
          alt="Camera thumbnail" 
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-vision-dark-800 flex items-center justify-center">
          <span className="text-vision-dark-400">No preview</span>
        </div>
      )}
    </>
  );
};

export default CameraThumbnail;
