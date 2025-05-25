
import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { setupCameraStream } from "@/services/apiService";
import { Camera } from "@/types/camera";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/services/loggingService";
import { rtspHandler } from "@/services/rtspStreamHandler";

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

  // Reset retry counter when camera changes
  useEffect(() => {
    retryCountRef.current = 0;
    logger.info(`Stream setup initialized`, 'stream-setup', `Camera: ${camera.name}, Type: ${camera.connectionType}`);
  }, [camera.id]);

  // Enhanced streaming setup with comprehensive logging
  useEffect(() => {
    if (!camera || !videoRef.current) return;
    
    let cleanup: (() => void) = () => {};
    
    const initializeStream = async () => {
      const videoElement = videoRef.current;
      if (!videoElement) return;

      logger.info(`Initializing stream`, 'stream-setup', `Camera: ${camera.name}, Status: ${camera.status}, Type: ${camera.connectionType}`);
      
      if (camera.status !== 'online') {
        logger.warning(`Camera offline`, 'stream-setup', `Camera ${camera.name} is ${camera.status}`);
        onLoadingChange(false);
        onError("Camera is offline. Please check camera connectivity and ensure it's powered on.");
        return;
      }
      
      onLoadingChange(true);
      onError(null);
      
      try {
        if (camera.connectionType === 'rtsp') {
          logger.info(`Setting up RTSP stream`, 'stream-setup', `Camera: ${camera.name}`);
          await setupRTSPStream(videoElement);
        }
        else if (camera.connectionType === 'hls' && camera.hlsUrl) {
          logger.info(`Setting up HLS stream`, 'stream-setup', `Camera: ${camera.name}, URL: ${camera.hlsUrl}`);
          await setupHlsStream(videoElement, camera.hlsUrl);
        }
        else if (camera.connectionType === 'rtmp' && camera.rtmpUrl) {
          logger.warning(`RTMP setup attempted`, 'stream-setup', `RTMP requires media server conversion`);
          onError("RTMP streams require media server conversion. Please configure HLS endpoint or contact administrator.");
          onLoadingChange(false);
        }
        else if (camera.connectionType === 'onvif') {
          logger.info(`Setting up ONVIF stream`, 'stream-setup', `Camera: ${camera.name}`);
          cleanup = setupCameraStream(camera, videoElement, (err) => {
            logger.error(`ONVIF stream error`, 'stream-setup', err, { camera: camera.name });
            onError(`ONVIF connection failed: ${err}`);
            onLoadingChange(false);
          });
        }
        else {
          logger.error(`Invalid stream configuration`, 'stream-setup', `Unknown connection type: ${camera.connectionType}`, { camera: camera.name });
          onError("Invalid stream configuration. Please check camera settings and ensure connection type is properly configured.");
          onLoadingChange(false);
        }
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        logger.error(`Stream setup failed`, 'stream-setup', errorMessage, { camera: camera.name });
        onError(`Stream initialization failed: ${errorMessage}`);
        onLoadingChange(false);
      }
    };
    
    // RTSP connection with enhanced error handling and logging
    const setupRTSPStream = async (videoElement: HTMLVideoElement) => {
      try {
        const result = await rtspHandler.connectRTSP(camera, videoElement);
        
        if (result.success) {
          logger.info(`RTSP stream connected successfully`, 'stream-setup', `Camera: ${camera.name}`);
          onLoadingChange(false);
          if (isPlaying) {
            videoElement.play().catch(e => {
              logger.warning(`Autoplay prevented`, 'stream-setup', e.message, { camera: camera.name });
            });
          }
          
          cleanup = () => {
            rtspHandler.disconnectCamera(camera.id);
          };
        } else {
          logger.error(`RTSP connection failed`, 'stream-setup', result.error || 'Unknown error', { camera: camera.name });
          onError(result.details || result.error || 'RTSP connection failed');
          onLoadingChange(false);
        }
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        logger.error(`RTSP setup error`, 'stream-setup', errorMessage, { camera: camera.name });
        onError(`RTSP setup failed: ${errorMessage}`);
        onLoadingChange(false);
      }
    };
    
    // HLS stream setup with logging
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
          logger.info(`HLS manifest parsed`, 'stream-setup', `Camera: ${camera.name}`);
          onLoadingChange(false);
          if (isPlaying) {
            videoElement.play().catch(e => {
              logger.warning(`HLS autoplay prevented`, 'stream-setup', e.message, { camera: camera.name });
            });
          }
        });
        
        hlsRef.current.on(Hls.Events.ERROR, (_, data) => {
          logger.error(`HLS error`, 'stream-setup', data.details, { camera: camera.name, data });
          if (data.fatal) {
            onError(`HLS stream error: ${data.details}`);
            onLoadingChange(false);
          }
        });
        
        cleanup = () => {
          if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
          }
        };
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        videoElement.src = hlsUrl;
        videoElement.addEventListener('loadeddata', () => {
          logger.info(`Native HLS loaded`, 'stream-setup', `Camera: ${camera.name}`);
          onLoadingChange(false);
          if (isPlaying) {
            videoElement.play().catch(e => logger.warning(`Native HLS autoplay prevented`, 'stream-setup', e.message));
          }
        });
        videoElement.addEventListener('error', () => {
          logger.error(`Native HLS failed`, 'stream-setup', 'Stream load error', { camera: camera.name });
          onError("HLS stream failed to load");
          onLoadingChange(false);
        });
        
        cleanup = () => {
          videoElement.src = '';
          videoElement.load();
        };
      } else {
        logger.error(`HLS not supported`, 'stream-setup', 'Browser does not support HLS', { camera: camera.name });
        onError("HLS not supported in this browser");
        onLoadingChange(false);
      }
    };
    
    initializeStream();
    
    return cleanup;
  }, [camera, isPlaying, onError, onLoadingChange]);

  const retryConnection = useCallback(() => {
    retryCountRef.current = 0;
    onLoadingChange(true);
    onError(null);
    
    logger.info(`Manual retry initiated`, 'stream-setup', `Camera: ${camera.name}`);
    
    if (videoRef.current) {
      videoRef.current.src = '';
      videoRef.current.load();
    }
    
    toast({
      title: "Reconnecting",
      description: `Attempting to reconnect to ${camera.name}...`,
    });
  }, [onLoadingChange, onError, camera.name, toast]);

  return { hlsRef, retryConnection };
}
