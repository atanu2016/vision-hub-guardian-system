
import { useEffect, useRef, useState, useCallback } from "react";
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
  const cleanupFnRef = useRef<(() => void) | null>(null);

  // Reset retry counter when camera changes
  useEffect(() => {
    retryCountRef.current = 0;
  }, [camera.id]);

  // Main streaming setup effect
  useEffect(() => {
    if (!camera) return;
    
    // Cleanup function for the current effect instance
    let localCleanup: (() => void) = () => {};
    
    const initializeStream = async () => {
      if (!videoRef.current) return;
      
      // Clean up any previous stream
      if (cleanupFnRef.current) {
        cleanupFnRef.current();
        cleanupFnRef.current = null;
      }
      
      if (camera.status === 'online') {
        onLoadingChange(true);
        onError(null);
        
        try {
          const videoElement = videoRef.current;
          
          // ----------------
          // Handle ONVIF camera type specifically
          // ----------------
          if (camera.connectionType === 'onvif') {
            console.log('Setting up ONVIF camera:', camera.name);
            console.log('ONVIF details:', {
              ip: camera.ipAddress,
              port: camera.port,
              username: camera.username ? 'set' : 'not set',
              path: camera.onvifPath
            });
            
            // For ONVIF cameras, use the specialized setupCameraStream function
            localCleanup = setupCameraStream(camera, videoElement, (err) => {
              console.error(`ONVIF stream setup error: ${err}`);
              onError(`Unable to play stream: ${err || 'Connection failed'}`);
              onLoadingChange(false);
              
              toast({
                title: "Stream Error",
                description: "Failed to connect to ONVIF camera. Check your camera settings and network.",
                variant: "destructive"
              });
            });
            
            // Monitor the video element for load events
            const handleLoadedData = () => {
              console.log('ONVIF camera stream loaded successfully');
              onLoadingChange(false);
              if (isPlaying) {
                videoElement.play().catch(e => {
                  console.warn("Autoplay prevented:", e);
                });
              }
            };
            
            videoElement.addEventListener('loadeddata', handleLoadedData);
            
            // Add additional cleanup for ONVIF
            const originalCleanup = localCleanup;
            localCleanup = () => {
              videoElement.removeEventListener('loadeddata', handleLoadedData);
              if (originalCleanup) originalCleanup();
            };
            
            cleanupFnRef.current = localCleanup;
            return;
          }
          
          // ----------------
          // Handle other camera types (HLS, RTMP, etc.)
          // ----------------
          let streamUrl = '';
          
          // Determine stream URL based on camera type
          if (camera.connectionType === 'hls' && camera.hlsUrl) {
            streamUrl = camera.hlsUrl;
          } else if (camera.connectionType === 'rtmp' && camera.rtmpUrl) {
            streamUrl = camera.rtmpUrl;
          } else if (camera.connectionType === 'rtsp' && camera.rtmpUrl) {
            streamUrl = camera.rtmpUrl;
          }
          
          if (!streamUrl) {
            console.error('No valid stream URL found for camera:', camera.name);
            onError("Missing stream URL");
            onLoadingChange(false);
            return;
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
                  onLoadingChange(false);
                  toast({
                    title: "Stream Error",
                    description: "Unable to connect to stream after multiple attempts",
                    variant: "destructive"
                  });
                }
              }
            });
            
            localCleanup = () => {
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
              onLoadingChange(false);
            };
            
            localCleanup = () => {
              videoElement.src = '';
              videoElement.load();
            };
          } else {
            console.error(`Unsupported stream URL format: ${streamUrl}`);
            onError("Unsupported stream format");
            onLoadingChange(false);
          }
          
          cleanupFnRef.current = localCleanup;
          
        } catch (err) {
          console.error("Stream setup error:", err);
          onError("Failed to initialize stream");
          onLoadingChange(false);
          
          toast({
            title: "Stream Error",
            description: "Failed to initialize camera stream",
            variant: "destructive"
          });
        }
      } else {
        onLoadingChange(false);
        onError(camera.status === 'offline' ? "Camera offline" : "Camera unavailable");
      }
    };
    
    initializeStream();
    
    return () => {
      if (localCleanup) localCleanup();
      if (cleanupFnRef.current) cleanupFnRef.current();
      cleanupFnRef.current = null;
    };
  }, [camera, isPlaying, onError, onLoadingChange, toast]);

  // Function to retry the connection manually
  const retryConnection = useCallback(() => {
    retryCountRef.current = 0;
    onLoadingChange(true);
    onError(null);
    
    // Force clean and reload the stream
    if (cleanupFnRef.current) {
      cleanupFnRef.current();
      cleanupFnRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.src = '';
      videoRef.current.load();
    }
    
    // The main effect will reinitialize the stream
  }, [onLoadingChange, onError]);

  return { hlsRef, retryConnection };
}
