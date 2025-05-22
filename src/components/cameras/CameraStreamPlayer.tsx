
import { useRef, useState, useCallback, memo } from "react";
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

// Using memo to prevent unnecessary rerenders
const CameraStreamPlayer = memo(({ camera, autoPlay = true, className = "" }: CameraStreamPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { hlsRef, retryConnection } = useStreamSetup({
    camera,
    videoRef,
    isPlaying,
    onError: setError,
    onLoadingChange: setIsLoading
  });
  
  // Memoized callback functions to prevent unnecessary rerenders
  const togglePlay = useCallback(() => {
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
    
    setIsPlaying(prev => !prev);
  }, [isPlaying, toast]);
  
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(prev => !prev);
  }, [isMuted]);

  const handleRetryConnection = useCallback(() => {
    console.log("Retrying camera connection:", camera.name);
    setError(null);
    setIsLoading(true);
    
    // Use the enhanced retry function
    retryConnection();
    
    toast({
      title: "Reconnecting",
      description: `Attempting to reconnect to ${camera.name}...`,
    });
  }, [camera.name, retryConnection, toast]);
  
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
});

CameraStreamPlayer.displayName = "CameraStreamPlayer";

export default CameraStreamPlayer;
