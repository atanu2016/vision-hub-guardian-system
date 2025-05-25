
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

  // Generate RTSP URL with enforced port 5543
  const generateRtspUrl = useCallback((camera: Camera): string | null => {
    if (camera.rtspUrl && camera.rtspUrl.trim() !== '') {
      let rtspUrl = camera.rtspUrl;
      
      // Force port 5543 in existing URL
      try {
        const url = new URL(rtspUrl);
        if (url.port !== '5543') {
          console.log(`CRITICAL: Correcting RTSP port from ${url.port || '554'} to 5543`);
          url.port = '5543';
          rtspUrl = url.toString();
        }
        console.log(`Using RTSP URL: ${rtspUrl.replace(/(:.*?@)/g, ':****@')}`);
        return rtspUrl;
      } catch (error) {
        console.error('Invalid RTSP URL format:', error);
        onError('Invalid RTSP URL format. Please check the URL syntax in camera settings.');
        return null;
      }
    }
    
    // Generate RTSP URL from camera details with port 5543
    if (camera.connectionType === 'rtsp' && camera.ipAddress && camera.username && camera.password) {
      const port = camera.port && camera.port === 5543 ? camera.port : 5543; // Force 5543
      const generatedUrl = `rtsp://${camera.username}:${camera.password}@${camera.ipAddress}:${port}/stream`;
      console.log(`Generated RTSP URL for ${camera.name}: ${generatedUrl.replace(/(:.*?@)/g, ':****@')}`);
      return generatedUrl;
    }
    
    return null;
  }, [onError]);

  // Enhanced RTSP URL validation with strict port 5543 enforcement
  const validateRtspUrl = useCallback((url: string): boolean => {
    if (!url || url.trim() === '') {
      console.error("RTSP URL is empty or blank");
      onError("RTSP URL is empty. Please configure the stream URL in camera settings with port 5543.");
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
      
      // CRITICAL: Enforce port 5543
      const port = urlObj.port || '554';
      if (port !== '5543') {
        console.error(`CRITICAL: RTSP URL using wrong port ${port}, must use 5543`);
        onError(`❌ CRITICAL ERROR: RTSP must use port 5543, not ${port}!\n\nThis system ONLY works with port 5543. Please:\n1. Update camera settings to use port 5543\n2. Change RTSP URL to use port 5543\n3. Click "Save Changes" and retry connection\n\nCurrent URL uses port: ${port}\nRequired port: 5543`);
        return false;
      }
      
      console.log(`✅ RTSP URL validation passed: ${url.replace(/(:.*?@)/g, ':****@')}`);
      return true;
    } catch (error) {
      console.error("RTSP URL validation failed:", error);
      onError("Invalid RTSP URL format. Please check the URL syntax in camera settings.");
      return false;
    }
  }, [onError]);

  // Enhanced streaming setup with strict port 5543 enforcement
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
        onError("Camera is offline. Please check camera connectivity and ensure it's powered on.");
        return;
      }
      
      onLoadingChange(true);
      onError(null);
      
      try {
        console.log(`Setting up stream for ${camera.name}, type: ${camera.connectionType}`);
        
        // Handle RTSP streams with strict port 5543 enforcement
        if (camera.connectionType === 'rtsp') {
          const rtspUrl = generateRtspUrl(camera);
          
          if (!rtspUrl) {
            onError("RTSP URL not configured. Please check camera settings and ensure RTSP URL with port 5543 is provided.");
            onLoadingChange(false);
            return;
          }
          
          // CRITICAL: Validate RTSP URL before attempting connection
          if (!validateRtspUrl(rtspUrl)) {
            onLoadingChange(false);
            return; // Error already set by validateRtspUrl
          }
          
          console.log(`✅ Attempting RTSP connection to: ${rtspUrl.replace(/(:.*?@)/g, ':****@')}`);
          
          // Try RTSP connection with port 5543
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
          onError("Invalid stream configuration. Please check camera settings and ensure connection type is properly configured.");
          onLoadingChange(false);
        }
        
        cleanupFnRef.current = localCleanup;
        
      } catch (err) {
        console.error("Stream setup error:", err);
        onError(`Stream initialization failed: ${err.message || 'Unknown error'}`);
        onLoadingChange(false);
      }
    };
    
    // RTSP connection with enhanced error handling for port 5543
    const tryRtspConnection = async (videoElement: HTMLVideoElement, rtspUrl: string) => {
      console.log("🔗 Connecting to RTSP stream on port 5543...");
      
      try {
        // Clear any previous source
        videoElement.src = '';
        videoElement.load();
        
        // Set the RTSP URL directly
        videoElement.src = rtspUrl;
        videoElement.load();
        
        let connectionSuccessful = false;
        
        const loadTimeout = setTimeout(() => {
          if (!connectionSuccessful && videoElement.readyState === 0) {
            console.error("❌ RTSP connection failed - port 5543 required");
            onError(`❌ RTSP stream connection failed on port 5543!

🔍 TROUBLESHOOTING CHECKLIST:

🔧 CAMERA CONFIGURATION:
• Ensure camera RTSP service is enabled
• Configure camera to stream on port 5543 (NOT 554)
• Verify username/password are correct
• Check camera firmware supports RTSP

🌐 NETWORK CONNECTIVITY:
• Verify network path to ${camera.ipAddress}:5543
• Check firewall allows port 5543 connections  
• Test camera web interface accessibility
• Ensure camera and system are on same network

📝 URL FORMAT:
Current: ${rtspUrl.replace(/(:.*?@)/g, ':****@')}
Required: rtsp://username:password@ip:5543/path

⚠️ CRITICAL: This system ONLY works with port 5543!`);
            onLoadingChange(false);
          }
        }, 10000);
        
        const handleLoadedData = () => {
          clearTimeout(loadTimeout);
          connectionSuccessful = true;
          console.log("✅ RTSP stream loaded successfully on port 5543");
          onLoadingChange(false);
          if (isPlaying) {
            videoElement.play().catch(e => {
              console.warn("Autoplay prevented:", e);
            });
          }
        };
        
        const handleError = (e: any) => {
          clearTimeout(loadTimeout);
          console.error("❌ RTSP connection failed:", e);
          onError(`❌ RTSP connection failed on port 5543!

Please verify:
• Camera streams on port 5543 (not 554)
• RTSP service is enabled on camera
• Username/password are correct: ${camera.username}
• Network connectivity to ${camera.ipAddress}:5543
• Camera supports RTSP protocol

URL: ${rtspUrl.replace(/(:.*?@)/g, ':****@')}

💡 TIP: Check camera documentation for RTSP configuration and ensure port 5543 is configured.`);
          onLoadingChange(false);
        };
        
        videoElement.addEventListener('loadeddata', handleLoadedData, { once: true });
        videoElement.addEventListener('error', handleError, { once: true });
        
        localCleanup = () => {
          clearTimeout(loadTimeout);
          videoElement.removeEventListener('loadeddata', handleLoadedData);
          videoElement.removeEventListener('error', handleError);
          videoElement.src = '';
          videoElement.load();
        };
        
      } catch (err) {
        console.error("RTSP setup error:", err);
        onError(`RTSP setup failed: ${err.message || 'Unknown error'}`);
        onLoadingChange(false);
      }
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
          backBufferLength: 30,
          maxBufferLength: 60,
          maxMaxBufferLength: 120,
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
    
    console.log(`🔄 Manually retrying connection to ${camera.name} on port 5543`);
    toast({
      title: "Reconnecting",
      description: `Attempting to reconnect to ${camera.name} on port 5543...`,
    });
  }, [onLoadingChange, onError, camera.name, toast]);

  return { hlsRef, retryConnection };
}
