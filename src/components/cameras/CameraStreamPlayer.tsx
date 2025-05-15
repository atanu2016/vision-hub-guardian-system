
import { useRef, useState } from "react";
import { Camera } from "@/types/camera";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useStreamSetup } from "./stream/useStreamSetup";
import { VideoPlayer } from "./stream/VideoPlayer";
import { LoadingIndicator } from "./stream/LoadingIndicator";
import { ErrorDisplay } from "./stream/ErrorDisplay";
import { StreamControls } from "./stream/StreamControls";

interface CameraStreamPlayerProps {
  camera: Camera;
  autoPlay?: boolean;
  className?: string;
}

const CameraStreamPlayer = ({ camera, autoPlay = true, className = "" }: CameraStreamPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { hlsRef } = useStreamSetup({
    camera,
    videoRef,
    isPlaying,
    onError: setError,
    onLoadingChange: setIsLoading
  });
  
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(e => {
        console.warn("Play prevented:", e);
        toast({
          title: "Error",
          description: "Unable to play the video. Please try again."
        });
      });
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleRetryConnection = () => {
    setError(null);
    setIsLoading(true);
    // Force reload the stream
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.load();
        if (isPlaying) {
          videoRef.current.play().catch(console.error);
        }
      }
    }, 500);
  };
  
  return (
    <div className={cn("relative bg-vision-dark-900 rounded-lg overflow-hidden", className)}>
      <VideoPlayer 
        videoRef={videoRef} 
        camera={camera} 
        isMuted={isMuted} 
        autoPlay={autoPlay} 
      />
      
      <LoadingIndicator isLoading={isLoading && !error} />
      
      <ErrorDisplay 
        error={error} 
        camera={camera} 
        onRetry={handleRetryConnection} 
      />
      
      <StreamControls 
        isPlaying={isPlaying} 
        isMuted={isMuted} 
        error={error}
        onTogglePlay={togglePlay} 
        onToggleMute={toggleMute} 
      />
    </div>
  );
};

export default CameraStreamPlayer;
