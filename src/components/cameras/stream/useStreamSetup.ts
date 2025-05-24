
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
  const maxRetries = 5;
  const cleanupFnRef = useRef<(() => void) | null>(null);

  // Reset retry counter when camera changes
  useEffect(() => {
    retryCountRef.current = 0;
  }, [camera.id]);

  // Generate RTSP URL if missing
  const generateRtspUrl = useCallback((camera: Camera): string | null => {
    if (camera.rtspUrl) {
      return camera.rtspUrl;
    }
    
    // Try to generate RTSP URL from camera details
    if (camera.connectionType === 'rtsp' && camera.ipAddress && camera.username && camera.password) {
      const port = camera.port || 554;
      const generatedUrl = `rtsp://${camera.username}:${camera.password}@${camera.ipAddress}:${port}/stream1`;
      console.log(`Generated RTSP URL for ${camera.name}: ${generatedUrl.replace(/(:.*?@)/g, ':****@')}`);
      return generatedUrl;
    }
    
    return null;
  }, []);

  // Main streaming setup effect
  useEffect(() => {
    if (!camera) return;
    
    let localCleanup: (() => void) = () => {};
    
    const initializeStream = async () => {
      if (!videoRef.current) return;
      
      // Clean up any previous stream
      if (cleanupFnRef.current) {
        cleanupFnRef.current();
        cleanupFnRef.current = null;
      }
      
      const shouldTryConnection = camera.status !== 'offline';
      
      if (shouldTryConnection) {
        onLoadingChange(true);
        onError(null);
        
        try {
          const videoElement = videoRef.current;
          
          // Handle ONVIF camera type specifically
          if (camera.connectionType === 'onvif') {
            console.log('Setting up ONVIF camera:', camera.name);
            console.log('ONVIF details:', {
              ip: camera.ipAddress,
              port: camera.port,
              username: camera.username ? 'set' : 'not set',
              path: camera.onvifPath
            });
            
            localCleanup = setupCameraStream(camera, videoElement, (err) => {
              console.error(`ONVIF stream setup error: ${err}`);
              onError(`Unable to play stream: ${err || 'Connection failed'}`);
              onLoadingChange(false);
            });
            
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
            
            const originalCleanup = localCleanup;
            localCleanup = () => {
              videoElement.removeEventListener('loadeddata', handleLoadedData);
              if (originalCleanup) originalCleanup();
            };
            
            cleanupFnRef.current = localCleanup;
            return;
          }
          
          // Handle other camera types
          let streamUrl = '';
          
          // Determine stream URL based on camera type
          if (camera.connectionType === 'hls' && camera.hlsUrl) {
            streamUrl = camera.hlsUrl;
          } else if (camera.connectionType === 'rtmp' && camera.rtmpUrl) {
            streamUrl = camera.rtmpUrl;
          } else if (camera.connectionType === 'rtsp') {
            streamUrl = generateRtspUrl(camera) || '';
            console.log('Using RTSP URL:', streamUrl.replace(/(:.*?@)/g, ':****@'));
          }
          
          if (!streamUrl) {
            console.error('No valid stream URL found for camera:', camera.name);
            onError("Missing stream URL - check camera configuration");
            onLoadingChange(false);
            return;
          }
          
          console.log(`Attempting to connect to: ${camera.connectionType} stream for ${camera.name}`);
          
          // Special handling for RTSP streams
          if (camera.connectionType === 'rtsp') {
            // For RTSP, we need a media server proxy or direct browser support
            try {
              // First try with browser native support (limited)
              videoElement.src = streamUrl;
              
              const handleError = (e: any) => {
                console.error("RTSP video element error:", e);
                console.error("Error details:", {
                  code: videoElement.error?.code,
                  message: videoElement.error?.message,
                  networkState: videoElement.networkState,
                  readyState: videoElement.readyState
                });
                
                // Provide more specific error messages
                if (videoElement.error?.code === 4) {
                  onError("RTSP stream format not supported by browser. A media server proxy is required.");
                } else if (videoElement.error?.code === 3) {
                  onError("RTSP stream decoding error. Check camera settings.");
                } else if (videoElement.error?.code === 2) {
                  onError("RTSP network error. Check camera connection and credentials.");
                } else {
                  onError("RTSP stream unavailable. Check camera connection settings.");
                }
                onLoadingChange(false);
              };
              
              const handleLoadedData = () => {
                console.log("RTSP stream loaded successfully");
                onLoadingChange(false);
                if (isPlaying) {
                  videoElement.play().catch(e => {
                    console.warn("Autoplay prevented:", e);
                  });
                }
              };
              
              videoElement.addEventListener('error', handleError);
              videoElement.addEventListener('loadeddata', handleLoadedData);
              
              // Set a timeout to detect if the stream doesn't load
              const loadTimeout = setTimeout(() => {
                if (videoElement.readyState === 0) {
                  console.warn("RTSP stream load timeout");
                  onError("RTSP stream connection timeout. This may require a media server proxy.");
                  onLoadingChange(false);
                }
              }, 10000); // 10 second timeout
              
              localCleanup = () => {
                clearTimeout(loadTimeout);
                videoElement.removeEventListener('error', handleError);
                videoElement.removeEventListener('loadeddata', handleLoadedData);
                videoElement.src = '';
                videoElement.load();
              };
            } catch (err) {
              console.error("RTSP setup error:", err);
              onError("RTSP stream setup failed");
              onLoadingChange(false);
            }
          }
          // Handle HLS streams
          else if (streamUrl && (streamUrl.includes('.m3u8') || camera.connectionType === 'hls') && Hls.isSupported()) {
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
              maxBufferSize: 60 * 1000 * 1000,
              maxBufferHole: 0.5,
              debug: false
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
                      break;
                  }
                } else {
                  onError("HLS stream unavailable after multiple attempts");
                  onLoadingChange(false);
                }
              }
            });
            
            localCleanup = () => {
              if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
              }
            };
          } 
          // Handle direct HTTP/HTTPS streams
          else if (streamUrl && (streamUrl.startsWith('http://') || streamUrl.startsWith('https://'))) {
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
              onError("Stream unavailable - check camera connection");
              onLoadingChange(false);
            };
            
            localCleanup = () => {
              videoElement.src = '';
              videoElement.load();
            };
          } else {
            console.error(`Unsupported stream URL: ${streamUrl}`);
            onError("Unsupported stream format or missing URL");
            onLoadingChange(false);
          }
          
          cleanupFnRef.current = localCleanup;
          
        } catch (err) {
          console.error("Stream setup error:", err);
          onError("Failed to initialize stream");
          onLoadingChange(false);
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
  }, [camera, isPlaying, onError, onLoadingChange, generateRtspUrl]);

  const retryConnection = useCallback(() => {
    retryCountRef.current = 0;
    onLoadingChange(true);
    onError(null);
    
    if (cleanupFnRef.current) {
      cleanupFnRef.current();
      cleanupFnRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.src = '';
      videoRef.current.load();
    }
    
    console.log(`Manually retrying connection to ${camera.name}`);
    toast({
      title: "Reconnecting",
      description: `Attempting to reconnect to ${camera.name}...`,
    });
  }, [onLoadingChange, onError, camera.name, toast]);

  return { hlsRef, retryConnection };
}
