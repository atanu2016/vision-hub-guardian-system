
import React, { useEffect } from "react";
import { Camera } from "@/types/camera";

interface VideoPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  camera: Camera;
  isMuted: boolean;
  autoPlay: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoRef, 
  camera, 
  isMuted, 
  autoPlay 
}) => {
  // Add CORS handling for local network connections
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.crossOrigin = "anonymous";
    }
  }, [videoRef]);
  
  return (
    <video
      ref={videoRef}
      muted={isMuted}
      playsInline
      autoPlay={autoPlay}
      className="h-full w-full object-contain bg-vision-dark-900"
      controls={false}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
};
