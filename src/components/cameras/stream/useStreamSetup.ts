
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
  const retryCountRef = useRef<number>(0);
  const maxRetries = 3;

  useEffect(() => {
    let cleanup: () => void = () => {};
    
    if (camera && camera.status === 'online') {
      onLoadingChange(true);
      onError(null);

      const initializeStream = async () => {
        if (!videoRef.current) return;
        
        try {
          const videoElement = videoRef.current;
          let streamUrl = '';
          
          // Determine stream URL based on camera type
          if (camera.connectionType === 'hls' && camera.hlsUrl) {
            streamUrl = camera.hlsUrl;
          } else if (camera.connectionType === 'rtmp' && camera.rtmpUrl) {
            streamUrl = camera.rtmpUrl;
          } else if (camera.connectionType === 'rtsp' && camera.rtmpUrl) {
            streamUrl = camera.rtmpUrl;
          }
          
          // If we have a direct URL that can be played with HLS.js
          if (streamUrl && (streamUrl.includes('.m3u8') || camera.connectionType === 'hls') && Hls.isSupported()) {
            // Destroy any existing HLS instance
            if (hlsRef.current) {
              hlsRef.current.destroy();
            }
            
            console.log(`Loading HLS stream: ${streamUrl}`);
            hlsRef.current = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90,
              maxBufferLength: 30,
              maxMaxBufferLength: 60,
              maxBufferSize: 60 * 1000 * 1000, // 60MB max buffer size
              maxBufferHole: 0.5,
              debug: true // Enable debug logs
            });
            
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
                
                if (retryCountRef.current < maxRetries) {
                  retryCountRef.current++;
                  console.log(`Retrying stream (${retryCountRef.current}/${maxRetries})...`);
                  
                  switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                      hlsRef.current?.startLoad();
                      break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                      hlsRef.current?.recoverMediaError();
                      break;
                    default:
                      // Cannot recover from other errors
                      break;
                  }
                } else {
                  onError("Stream unavailable after multiple attempts");
                  toast({
                    title: "Stream Error",
                    description: "Unable to connect to stream after multiple attempts",
                    variant: "destructive"
                  });
                }
              }
            });
            
            cleanup = () => {
              if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
              }
            };
          } else if (streamUrl && (streamUrl.startsWith('http://') || streamUrl.startsWith('https://'))) {
            // For direct video sources that don't need HLS.js
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
              console.error("Video element error:", e);
              console.error("Error code:", videoElement.error?.code);
              console.error("Error message:", videoElement.error?.message);
              onError("Stream unavailable");
            };
            
            cleanup = () => {
              videoElement.src = '';
              videoElement.load();
            };
          } else {
            // For ONVIF and other camera types that need special handling
            console.log(`Initializing ${camera.connectionType} camera with setupCameraStream`);
            console.log("Camera details:", JSON.stringify({
              type: camera.connectionType,
              ip: camera.ipAddress,
              port: camera.port,
              path: camera.onvifPath,
              hasCredentials: !!camera.username && !!camera.password
            }));
            
            cleanup = setupCameraStream(camera, videoElement, (err) => {
              console.error(`Stream setup error via API service (${camera.connectionType}):`, err);
              onError(`Unable to play stream: ${err || 'Unknown error'}`);
            });
            
            videoElement.onloadeddata = () => {
              console.log("Stream loaded via API service");
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
