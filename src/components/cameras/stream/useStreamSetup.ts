
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
  const maxRetries = 5; // Increased from 3 to give more chances for connecting
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
      
      // For local network, consider camera online unless explicitly marked offline
      const shouldTryConnection = camera.status !== 'offline';
      
      if (shouldTryConnection) {
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
          // Handle other camera types (HLS, RTMP, RTSP, etc.)
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
          
          console.log(`Attempting to connect to: ${camera.connectionType} stream for ${camera.name}`);
          console.log(`Stream URL: ${streamUrl.replace(/(:.*?@)/g, ':****@')}`); // Log URL with password masked
          
          // Special handling for RTSP streams
          if (camera.connectionType === 'rtsp') {
            // For direct RTSP playback through browser-based player
            // Note: Direct RTSP playback often requires server-side proxy
            
            // Attempt to create source with proper MIME type
            try {
              if ('MediaSource' in window || 'WebKitMediaSource' in window) {
                const source = new MediaSource();
                videoElement.src = URL.createObjectURL(source);
                
                source.addEventListener('sourceopen', () => {
                  try {
                    // For RTSP we often need server-proxy endpoint to convert to MSE-compatible format
                    const proxyUrl = `/api/stream-proxy?url=${encodeURIComponent(streamUrl)}`;
                    fetch(proxyUrl)
                      .then(response => {
                        if (!response.ok) throw new Error('Proxy connection failed');
                        // Handle proxy connection
                      })
                      .catch(err => {
                        console.error("RTSP proxy error:", err);
                        // Fall back to direct URL if proxy fails
                        videoElement.src = streamUrl;
                      });
                  } catch (err) {
                    console.error("MediaSource error:", err);
                  }
                });
                
                // Fallback for direct playback attempt
                setTimeout(() => {
                  if (videoElement.readyState === 0) {
                    videoElement.src = streamUrl;
                  }
                }, 5000);
              } else {
                // If MediaSource not supported, try direct
                videoElement.src = streamUrl;
              }
            } catch (err) {
              console.error("RTSP setup error:", err);
              videoElement.src = streamUrl; // Try direct as last resort
            }
            
            videoElement.onerror = (e) => {
              console.error("RTSP video element error:", e);
              onError("RTSP stream unavailable. Check camera connection settings.");
              onLoadingChange(false);
            };
            
            videoElement.onloadeddata = () => {
              console.log("RTSP stream loaded successfully");
              onLoadingChange(false);
              if (isPlaying) {
                videoElement.play().catch(e => {
                  console.warn("Autoplay prevented:", e);
                });
              }
            };
            
            localCleanup = () => {
              videoElement.src = '';
              videoElement.load();
            };
          }
          // If we have a direct URL that can be played with HLS.js
          else if (streamUrl && (streamUrl.includes('.m3u8') || camera.connectionType === 'hls') && Hls.isSupported()) {
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
              debug: false // Disable verbose logs in production
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
            // Try direct connection for local network cameras as a last resort
            console.log(`Attempting direct connection for: ${streamUrl}`);
            videoElement.src = streamUrl;
            videoElement.onloadeddata = () => {
              console.log("Direct stream loaded successfully");
              onLoadingChange(false);
              if (isPlaying) {
                videoElement.play().catch(e => {
                  console.warn("Autoplay prevented:", e);
                });
              }
            };
            
            videoElement.onerror = (e) => {
              console.error("Unsupported stream format:", e);
              onError("Unsupported stream format");
              onLoadingChange(false);
            };
            
            localCleanup = () => {
              videoElement.src = '';
              videoElement.load();
            };
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
    console.log(`Manually retrying connection to ${camera.name}`);
    toast({
      title: "Reconnecting",
      description: `Attempting to reconnect to ${camera.name}...`,
    });
  }, [onLoadingChange, onError, camera.name, toast]);

  return { hlsRef, retryConnection };
}
