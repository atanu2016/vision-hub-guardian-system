
import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { setupCameraStream } from "@/services/apiService";
import { Camera } from "@/types/camera";
import { useToast } from "@/hooks/use-toast";

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
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    let cleanup: () => void = () => {};
    
    if (camera && camera.status === 'online') {
      onLoadingChange(true);
      onError(null);

      const initializeStream = async () => {
        if (!videoRef.current) return;
        
        try {
          const videoElement = videoRef.current;
          const streamUrl = camera.rtmpUrl || '';
          
          // If the URL is an HLS stream and browser supports HLS.js
          if (streamUrl && (streamUrl.includes('.m3u8') || streamUrl.includes('.flv')) && Hls.isSupported()) {
            // Destroy any existing HLS instance
            if (hlsRef.current) {
              hlsRef.current.destroy();
            }
            
            hlsRef.current = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90,
              maxBufferLength: 30,
              maxMaxBufferLength: 60,
              maxBufferSize: 60 * 1000 * 1000, // 60MB max buffer size
              maxBufferHole: 0.5
            });
            
            console.log(`Loading HLS stream: ${streamUrl}`);
            hlsRef.current.loadSource(streamUrl);
            hlsRef.current.attachMedia(videoElement);
            
            hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
              console.log("HLS manifest parsed successfully");
              onLoadingChange(false);
              if (isPlaying) {
                videoElement.play().catch(e => {
                  console.warn("Autoplay prevented:", e);
                });
              }
            });
            
            hlsRef.current.on(Hls.Events.ERROR, (_, data) => {
              console.error("HLS error:", data);
              if (data.fatal) {
                console.error("Fatal HLS error:", data);
                onError("Stream unavailable");
                
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                  toast({
                    title: "Network Error",
                    description: "Unable to load the camera stream due to network issues."
                  });
                }
                
                // Try to recover on fatal errors
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    hlsRef.current?.startLoad();
                    break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    hlsRef.current?.recoverMediaError();
                    break;
                  default:
                    // Cannot recover
                    break;
                }
              }
            });
            
            cleanup = () => {
              if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
              }
            };
          } else if (streamUrl) {
            // For direct video sources
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

  return { hlsRef };
}
