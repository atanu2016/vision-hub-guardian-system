
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

  // Generate RTSP URL with proper port 5543
  const generateRtspUrl = useCallback((camera: Camera): string | null => {
    if (camera.rtspUrl && camera.rtspUrl.trim() !== '') {
      console.log(`Using provided RTSP URL: ${camera.rtspUrl.replace(/(:.*?@)/g, ':****@')}`);
      return camera.rtspUrl;
    }
    
    // Generate RTSP URL from camera details with port 5543 as default
    if (camera.connectionType === 'rtsp' && camera.ipAddress && camera.username && camera.password) {
      const port = 5543; // Always use 5543 for RTSP
      const generatedUrl = `rtsp://${camera.username}:${camera.password}@${camera.ipAddress}:${port}/stream`;
      console.log(`Generated RTSP URL for ${camera.name}: ${generatedUrl.replace(/(:.*?@)/g, ':****@')}`);
      return generatedUrl;
    }
    
    return null;
  }, []);

  // Validate RTSP URL format and ensure it uses port 5543
  const validateRtspUrl = useCallback((url: string): boolean => {
    if (!url || url.trim() === '') {
      console.error("RTSP URL is empty or blank");
      onError("RTSP URL is empty. Please configure the stream URL.");
      return false;
    }
    
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol !== 'rtsp:') {
        console.error("Invalid RTSP protocol");
        onError("Invalid RTSP URL. Must start with rtsp://");
        return false;
      }
      
      if (!urlObj.hostname) {
        console.error("RTSP URL missing hostname");
        onError("RTSP URL missing hostname or IP address");
        return false;
      }
      
      // Check if using the correct port 5543
      const port = urlObj.port || '554';
      if (port !== '5543') {
        console.warn(`RTSP URL using port ${port}, recommending port 5543`);
        onError(`RTSP URL is using port ${port}. For better compatibility, use port 5543.`);
        return false;
      }
      
      console.log(`RTSP URL validation passed: ${url.replace(/(:.*?@)/g, ':****@')}`);
      return true;
    } catch (error) {
      console.error("RTSP URL validation failed:", error);
      onError("Invalid RTSP URL format. Please check the URL syntax.");
      return false;
    }
  }, [onError]);

  // Enhanced streaming setup with proper RTSP handling
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
        onError("Camera is offline. Please check camera connectivity.");
        return;
      }
      
      onLoadingChange(true);
      onError(null);
      
      try {
        console.log(`Setting up stream for ${camera.name}, type: ${camera.connectionType}`);
        
        // Handle RTSP streams with enhanced logic
        if (camera.connectionType === 'rtsp') {
          const rtspUrl = generateRtspUrl(camera);
          
          if (!rtspUrl) {
            onError("RTSP URL not configured. Please check camera settings and ensure RTSP URL is provided.");
            onLoadingChange(false);
            return;
          }
          
          // Validate RTSP URL before attempting connection
          if (!validateRtspUrl(rtspUrl)) {
            onLoadingChange(false);
            return; // Error already set by validateRtspUrl
          }
          
          console.log(`Attempting RTSP connection to: ${rtspUrl.replace(/(:.*?@)/g, ':****@')}`);
          
          // Try multiple connection methods for RTSP
          await tryRtspConnection(videoElement, rtspUrl);
        }
        // Handle HLS streams
        else if (camera.connectionType === 'hls' && camera.hlsUrl) {
          console.log(`Loading HLS stream: ${camera.hlsUrl}`);
          await setupHlsStream(videoElement, camera.hlsUrl);
        }
        // Handle RTMP streams
        else if (camera.connectionType === 'rtmp' && camera.rtmpUrl) {
          console.log("RTMP streams require media server conversion to HLS/WebRTC");
          onError("RTMP streams require media server conversion. Please configure HLS endpoint or contact administrator.");
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
        }
        else {
          onError("Invalid stream configuration. Please check camera settings and connection type.");
          onLoadingChange(false);
        }
        
        cleanupFnRef.current = localCleanup;
        
      } catch (err) {
        console.error("Stream setup error:", err);
        onError(`Stream initialization failed: ${err.message || 'Unknown error'}`);
        onLoadingChange(false);
      }
    };
    
    // RTSP connection with multiple fallback methods
    const tryRtspConnection = async (videoElement: HTMLVideoElement, rtspUrl: string) => {
      console.log("Trying RTSP connection methods...");
      
      try {
        // Method 1: Try HLS proxy first (most reliable for web browsers)
        const hlsProxyUrl = `/api/stream/rtsp-to-hls?url=${encodeURIComponent(rtspUrl)}`;
        console.log("Attempting HLS proxy for RTSP stream...");
        
        if (Hls.isSupported()) {
          if (hlsRef.current) {
            hlsRef.current.destroy();
          }
          
          hlsRef.current = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 30,
            maxBufferLength: 60,
            maxMaxBufferLength: 120,
            maxBufferSize: 60 * 1000 * 1000,
            maxBufferHole: 0.5,
            debug: false,
            fragLoadingTimeOut: 10000,
            manifestLoadingTimeOut: 5000,
            levelLoadingTimeOut: 10000
          });
          
          hlsRef.current.loadSource(hlsProxyUrl);
          hlsRef.current.attachMedia(videoElement);
          
          let connectionSuccessful = false;
          
          hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log("HLS proxy manifest parsed successfully");
            connectionSuccessful = true;
            onLoadingChange(false);
            if (isPlaying) {
              videoElement.play().catch(e => {
                console.warn("Autoplay prevented:", e);
              });
            }
          });
          
          hlsRef.current.on(Hls.Events.ERROR, (_, data) => {
            console.error("HLS proxy error:", data);
            if (data.fatal && !connectionSuccessful) {
              console.log("HLS proxy failed, trying direct connection...");
              tryDirectRtspConnection(videoElement, rtspUrl);
            }
          });
          
          // Timeout for HLS proxy
          setTimeout(() => {
            if (!connectionSuccessful && videoElement.readyState === 0) {
              console.log("HLS proxy timeout, trying direct connection...");
              tryDirectRtspConnection(videoElement, rtspUrl);
            }
          }, 8000);
          
          localCleanup = () => {
            if (hlsRef.current) {
              hlsRef.current.destroy();
              hlsRef.current = null;
            }
          };
        } else {
          tryDirectRtspConnection(videoElement, rtspUrl);
        }
      } catch (err) {
        console.error("HLS proxy setup error:", err);
        tryDirectRtspConnection(videoElement, rtspUrl);
      }
    };
    
    // Direct RTSP connection methods
    const tryDirectRtspConnection = (videoElement: HTMLVideoElement, rtspUrl: string) => {
      console.log("Trying direct RTSP connection...");
      
      // Clear any previous source
      videoElement.src = '';
      videoElement.load();
      
      // Set the RTSP URL directly
      videoElement.src = rtspUrl;
      videoElement.load();
      
      const loadTimeout = setTimeout(() => {
        if (videoElement.readyState === 0) {
          console.error("All RTSP connection methods failed");
          onError(`RTSP stream connection failed. Please verify:
1. RTSP URL is correct and accessible
2. Camera is using port 5543
3. Network connectivity to ${camera.ipAddress}:5543
4. Camera RTSP service is enabled`);
          onLoadingChange(false);
        }
      }, 10000);
      
      const handleLoadedData = () => {
        clearTimeout(loadTimeout);
        console.log("Direct RTSP stream loaded successfully");
        onLoadingChange(false);
        if (isPlaying) {
          videoElement.play().catch(e => {
            console.warn("Autoplay prevented:", e);
          });
        }
      };
      
      const handleError = (e: any) => {
        clearTimeout(loadTimeout);
        console.error("Direct RTSP connection failed:", e);
        onError(`RTSP connection failed. Please check:
1. RTSP URL format: rtsp://username:password@ip:5543/path
2. Camera network connectivity
3. RTSP service enabled on camera`);
        onLoadingChange(false);
      };
      
      videoElement.addEventListener('loadeddata', handleLoadedData, { once: true });
      videoElement.addEventListener('error', handleError, { once: true });
    };
    
    // HLS stream setup
    const setupHlsStream = async (videoElement: HTMLVideoElement, hlsUrl: string) => {
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
        
        hlsRef.current.loadSource(hlsUrl);
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
        videoElement.src = hlsUrl;
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
    };
    
    initializeStream();
    
    return () => {
      if (localCleanup) localCleanup();
      if (cleanupFnRef.current) cleanupFnRef.current();
      cleanupFnRef.current = null;
    };
  }, [camera, isPlaying, onError, onLoadingChange, generateRtspUrl, validateRtspUrl]);

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
    
    console.log(`Manually retrying connection to ${camera.name} on port 5543`);
    toast({
      title: "Reconnecting",
      description: `Attempting to reconnect to ${camera.name} on port 5543...`,
    });
  }, [onLoadingChange, onError, camera.name, toast]);

  return { hlsRef, retryConnection };
}
