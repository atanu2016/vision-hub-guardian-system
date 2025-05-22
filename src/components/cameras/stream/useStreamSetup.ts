
import { useEffect, useRef } from "react";
import { setupCameraStream } from "@/services/apiService";
import { Camera } from "@/types/camera";
import { useToast } from "@/hooks/use-toast";
import { toUICamera } from "@/utils/cameraPropertyMapper";

interface UseStreamSetupOptions {
  camera: Camera;
  videoRef: React.RefObject<HTMLVideoElement>;
  isPlaying: boolean;
  onError: (error: string) => void;
  onLoadingChange: (loading: boolean) => void;
}

export function useStreamSetup({
  camera,
  videoRef,
  isPlaying,
  onError,
  onLoadingChange
}: UseStreamSetupOptions) {
  const { toast } = useToast();
  const hlsRef = useRef<any | null>(null); // Keep ref for cleanup purposes

  useEffect(() => {
    let cleanup: () => void = () => {};
    
    if (camera && camera.status === 'online') {
      onLoadingChange(true);
      onError(null);

      const initializeStream = async () => {
        if (!videoRef.current) return;
        
        try {
          const videoElement = videoRef.current;
          const cameraUI = toUICamera(camera);
          const streamUrl = cameraUI.rtmpUrl || '';
          
          // For direct video sources
          if (streamUrl) {
            videoElement.src = streamUrl;
            videoElement.onloadeddata = () => {
              console.log("Direct video stream loaded");
              onLoadingChange(false);
              if (isPlaying) {
                videoElement.play().catch(e => {
                  console.warn("Autoplay prevented:", e);
                });
              }
            };
            
            videoElement.onerror = (e) => {
              console.error("Video error:", e);
              onError("Stream unavailable");
            };
            
            cleanup = () => {
              videoElement.src = '';
              videoElement.load();
            };
          } else {
            // For other stream types via API service
            cleanup = setupCameraStream(camera, videoElement, (err) => {
              console.error("Stream setup error via API service:", err);
              onError("Unable to play stream");
            });
            
            videoElement.onloadeddata = () => {
              onLoadingChange(false);
            };
            
            videoElement.onerror = () => {
              onError("Stream unavailable");
            };
          }
        } catch (err) {
          console.error("Stream setup error:", err);
          onError("Failed to initialize stream");
        }
      };
      
      initializeStream();
    } else {
      onLoadingChange(false);
      onError(camera.status === 'offline' ? "Camera offline" : "Camera unavailable");
    }
    
    return () => {
      cleanup();
    };
  }, [camera, isPlaying, onError, onLoadingChange, toast]);

  return { hlsRef }; // Return the ref for consistency with previous API
}
