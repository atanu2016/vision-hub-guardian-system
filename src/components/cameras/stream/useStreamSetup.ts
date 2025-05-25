
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

  // Generate RTSP URL if missing
  const generateRtspUrl = useCallback((camera: Camera): string | null => {
    if (camera.rtspUrl) {
      return camera.rtspUrl;
    }
    
    // Generate RTSP URL from camera details
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
    if (!camera || !videoRef.current) return;
    
    let localCleanup: (() => void) = () => {};
    
    const initializeStream = async () => {
      const videoElement = videoRef.current;
      if (!videoElement) return;
      
      // Clean up any previous stream
      if (cleanupFnRef.current) {
        cleanupFnRef.current();
        cleanupFnRef.current = null;
      }
      
      if (camera.status !== 'online') {
        onLoadingChange(false);
        onError("Camera is offline");
        return;
      }
      
      onLoadingChange(true);
      onError(null);
      
      try {
        console.log(`Setting up stream for ${camera.name}, type: ${camera.connectionType}`);
        
        // Handle RTSP streams with improved logic
        if (camera.connectionType === 'rtsp') {
          const rtspUrl = generateRtspUrl(camera);
          
          if (!rtspUrl) {
            onError("RTSP URL not configured. Please check camera settings.");
            onLoadingChange(false);
            return;
          }
          
          console.log(`Attempting RTSP connection to: ${rtspUrl.replace(/(:.*?@)/g, ':****@')}`);
          
          // First try: Direct RTSP (limited browser support)
          try {
            videoElement.src = rtspUrl;
            videoElement.load();
            
            const loadTimeout = setTimeout(() => {
              if (videoElement.readyState === 0) {
                console.log("RTSP direct connection timeout, trying alternative methods...");
                // Try WebRTC or HLS proxy if available
                tryAlternativeRtspMethods(camera, videoElement);
              }
            }, 5000);
            
            const handleLoadedData = () => {
              clearTimeout(loadTimeout);
              console.log("RTSP stream loaded successfully via direct connection");
              onLoadingChange(false);
              if (isPlaying) {
                videoElement.play().catch(e => {
                  console.warn("Autoplay prevented:", e);
                });
              }
            };
            
            const handleError = (e: any) => {
              clearTimeout(loadTimeout);
              console.error("RTSP direct connection failed:", e);
              console.log("Trying alternative RTSP methods...");
              tryAlternativeRtspMethods(camera, videoElement);
            };
            
            videoElement.addEventListener('loadeddata', handleLoadedData);
            videoElement.addEventListener('error', handleError);
            
            localCleanup = () => {
              clearTimeout(loadTimeout);
              videoElement.removeEventListener('loadeddata', handleLoadedData);
              videoElement.removeEventListener('error', handleError);
              videoElement.src = '';
              videoElement.load();
            };
          } catch (err) {
            console.error("RTSP setup error:", err);
            tryAlternativeRtspMethods(camera, videoElement);
          }
        }
        // Handle HLS streams
        else if (camera.connectionType === 'hls' && camera.hlsUrl) {
          console.log(`Loading HLS stream: ${camera.hlsUrl}`);
          
          if (Hls.isSupported()) {
            if (hlsRef.current) {
              hlsRef.current.destroy();
            }
            
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
            
            hlsRef.current.loadSource(camera.hlsUrl);
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
                onError(`HLS stream error: ${data.details}`);
                onLoadingChange(false);
              }
            });
            
            localCleanup = () => {
              if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
              }
            };
          } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            videoElement.src = camera.hlsUrl;
            videoElement.addEventListener('loadeddata', () => {
              onLoadingChange(false);
              if (isPlaying) {
                videoElement.play().catch(e => console.warn("Autoplay prevented:", e));
              }
            });
            videoElement.addEventListener('error', () => {
              onError("HLS stream failed to load");
              onLoadingChange(false);
            });
            
            localCleanup = () => {
              videoElement.src = '';
              videoElement.load();
            };
          } else {
            onError("HLS not supported in this browser");
            onLoadingChange(false);
          }
        }
        // Handle RTMP streams
        else if (camera.connectionType === 'rtmp' && camera.rtmpUrl) {
          console.log("RTMP streams require a media server conversion to HLS/WebRTC");
          onError("RTMP streams require media server conversion. Please configure HLS endpoint.");
          onLoadingChange(false);
        }
        // Handle ONVIF cameras
        else if (camera.connectionType === 'onvif') {
          console.log('Setting up ONVIF camera:', camera.name);
          
          localCleanup = setupCameraStream(camera, videoElement, (err) => {
            console.error(`ONVIF stream error: ${err}`);
            onError(`ONVIF connection failed: ${err}`);
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
        }
        else {
          onError("Invalid stream configuration. Please check camera settings.");
          onLoadingChange(false);
        }
        
        cleanupFnRef.current = localCleanup;
        
      } catch (err) {
        console.error("Stream setup error:", err);
        onError(`Stream initialization failed: ${err.message || 'Unknown error'}`);
        onLoadingChange(false);
      }
    };
    
    // Alternative methods for RTSP when direct connection fails
    const tryAlternativeRtspMethods = (camera: Camera, videoElement: HTMLVideoElement) => {
      console.log("Trying alternative RTSP connection methods...");
      
      // Method 1: Try to find if there's an HLS proxy endpoint
      const possibleHlsUrl = `${window.location.origin}/api/stream/rtsp-to-hls/${encodeURIComponent(camera.id)}`;
      
      fetch(possibleHlsUrl, { method: 'HEAD' })
        .then(response => {
          if (response.ok) {
            console.log("Found HLS proxy endpoint, using that instead");
            if (Hls.isSupported()) {
              if (hlsRef.current) {
                hlsRef.current.destroy();
              }
              
              hlsRef.current = new Hls();
              hlsRef.current.loadSource(possibleHlsUrl);
              hlsRef.current.attachMedia(videoElement);
              
              hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
                onLoadingChange(false);
                if (isPlaying) {
                  videoElement.play().catch(e => console.warn("Autoplay prevented:", e));
                }
              });
              
              hlsRef.current.on(Hls.Events.ERROR, () => {
                onError("RTSP stream requires media server proxy. Please configure streaming server.");
                onLoadingChange(false);
              });
            }
          } else {
            throw new Error("No proxy available");
          }
        })
        .catch(() => {
          onError("RTSP stream requires media server proxy (FFmpeg/GStreamer) to convert to web-compatible format.");
          onLoadingChange(false);
        });
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
