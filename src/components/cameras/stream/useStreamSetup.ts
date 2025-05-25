
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
      const generatedUrl = `rtsp://${camera.username}:${camera.password}@${camera.ipAddress}:${port}/live/channel0`;
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
        
        // Handle RTSP streams - try multiple approaches
        if (camera.connectionType === 'rtsp') {
          const rtspUrl = generateRtspUrl(camera);
          
          if (!rtspUrl) {
            onError("RTSP URL not configured. Please check camera settings.");
            onLoadingChange(false);
            return;
          }
          
          console.log(`Attempting RTSP connection to: ${rtspUrl.replace(/(:.*?@)/g, ':****@')}`);
          
          // Method 1: Try HLS proxy first (most reliable for web browsers)
          try {
            const hlsProxyUrl = `/api/stream/rtsp-to-hls?url=${encodeURIComponent(rtspUrl)}`;
            console.log("Trying HLS proxy for RTSP stream...");
            
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
                debug: false,
                fragLoadingTimeOut: 20000,
                manifestLoadingTimeOut: 10000,
                levelLoadingTimeOut: 10000
              });
              
              hlsRef.current.loadSource(hlsProxyUrl);
              hlsRef.current.attachMedia(videoElement);
              
              hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log("HLS proxy manifest parsed successfully");
                onLoadingChange(false);
                if (isPlaying) {
                  videoElement.play().catch(e => {
                    console.warn("Autoplay prevented:", e);
                  });
                }
              });
              
              hlsRef.current.on(Hls.Events.ERROR, (_, data) => {
                console.error("HLS proxy error:", data);
                if (data.fatal) {
                  console.log("HLS proxy failed, trying direct methods...");
                  tryDirectRtspMethods(camera, videoElement, rtspUrl);
                }
              });
              
              // Timeout for HLS proxy
              setTimeout(() => {
                if (videoElement.readyState === 0) {
                  console.log("HLS proxy timeout, trying direct methods...");
                  tryDirectRtspMethods(camera, videoElement, rtspUrl);
                }
              }, 8000);
              
              localCleanup = () => {
                if (hlsRef.current) {
                  hlsRef.current.destroy();
                  hlsRef.current = null;
                }
              };
            } else {
              tryDirectRtspMethods(camera, videoElement, rtspUrl);
            }
          } catch (err) {
            console.error("HLS proxy setup error:", err);
            tryDirectRtspMethods(camera, videoElement, rtspUrl);
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
    
    // Direct RTSP methods when proxy fails
    const tryDirectRtspMethods = (camera: Camera, videoElement: HTMLVideoElement, rtspUrl: string) => {
      console.log("Trying direct RTSP connection methods...");
      
      // Method 1: Direct RTSP (limited browser support)
      try {
        videoElement.src = rtspUrl;
        videoElement.load();
        
        const loadTimeout = setTimeout(() => {
          if (videoElement.readyState === 0) {
            console.log("Direct RTSP timeout, trying WebRTC proxy...");
            tryWebRtcProxy(camera, videoElement, rtspUrl);
          }
        }, 5000);
        
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
          tryWebRtcProxy(camera, videoElement, rtspUrl);
        };
        
        videoElement.addEventListener('loadeddata', handleLoadedData, { once: true });
        videoElement.addEventListener('error', handleError, { once: true });
        
      } catch (err) {
        console.error("Direct RTSP setup error:", err);
        tryWebRtcProxy(camera, videoElement, rtspUrl);
      }
    };
    
    // WebRTC proxy method
    const tryWebRtcProxy = (camera: Camera, videoElement: HTMLVideoElement, rtspUrl: string) => {
      console.log("Trying WebRTC proxy for RTSP...");
      
      const webrtcUrl = `/api/stream/rtsp-to-webrtc?url=${encodeURIComponent(rtspUrl)}`;
      
      fetch(webrtcUrl, { method: 'POST' })
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("WebRTC proxy not available");
        })
        .then(data => {
          if (data.streamUrl) {
            videoElement.src = data.streamUrl;
            videoElement.load();
            
            videoElement.addEventListener('loadeddata', () => {
              onLoadingChange(false);
              if (isPlaying) {
                videoElement.play().catch(e => console.warn("Autoplay prevented:", e));
              }
            }, { once: true });
          } else {
            throw new Error("No stream URL provided");
          }
        })
        .catch(() => {
          console.error("All RTSP connection methods failed");
          onError("RTSP stream requires media server proxy. Please ensure your RTSP URL is correct and accessible from the server.");
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
