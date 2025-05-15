
import React from "react";
import { Camera } from "@/types/camera";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
  return (
    <AspectRatio ratio={16/9}>
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={camera.thumbnail || '/placeholder.svg'}
        muted={isMuted}
        playsInline
        autoPlay={autoPlay}
      />
    </AspectRatio>
  );
};
