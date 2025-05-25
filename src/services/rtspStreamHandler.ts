
import { Camera } from "@/types/camera";
import { logger } from "./loggingService";

export interface RTSPConnectionResult {
  success: boolean;
  error?: string;
  details?: string;
  videoElement?: HTMLVideoElement;
}

export class RTSPStreamHandler {
  private static instance: RTSPStreamHandler;
  private activeConnections: Map<string, HTMLVideoElement> = new Map();

  static getInstance(): RTSPStreamHandler {
    if (!RTSPStreamHandler.instance) {
      RTSPStreamHandler.instance = new RTSPStreamHandler();
    }
    return RTSPStreamHandler.instance;
  }

  async connectRTSP(camera: Camera, videoElement: HTMLVideoElement): Promise<RTSPConnectionResult> {
    try {
      logger.info(`Starting RTSP connection process`, 'rtsp-handler', `Camera: ${camera.name}`);

      // Validate camera data
      if (!camera.rtspUrl || !camera.rtspUrl.trim()) {
        const error = `RTSP URL is empty for camera ${camera.name}`;
        logger.error(error, 'rtsp-handler', 'No RTSP URL configured');
        return { success: false, error };
      }

      // Parse and validate RTSP URL
      const rtspUrl = camera.rtspUrl.trim();
      logger.debug(`Parsing RTSP URL`, 'rtsp-handler', rtspUrl.replace(/(:.*?@)/g, ':****@'));

      let parsedUrl: URL;
      try {
        parsedUrl = new URL(rtspUrl);
      } catch (urlError) {
        const error = `Invalid RTSP URL format for ${camera.name}`;
        logger.error(error, 'rtsp-handler', `URL parsing failed: ${urlError}`);
        return { success: false, error };
      }

      // Validate protocol
      if (parsedUrl.protocol !== 'rtsp:') {
        const error = `Invalid protocol for ${camera.name}. Expected rtsp:// but got ${parsedUrl.protocol}`;
        logger.error(error, 'rtsp-handler', `Protocol: ${parsedUrl.protocol}`);
        return { success: false, error };
      }

      // Check port requirement (must be 5543)
      const detectedPort = parsedUrl.port || '554';
      if (detectedPort !== '5543') {
        logger.logRTSPPortIssue(camera.name, detectedPort, '5543');
        const error = `❌ CRITICAL: Camera ${camera.name} is using port ${detectedPort}. This system REQUIRES port 5543!`;
        return { 
          success: false, 
          error,
          details: `Please update your camera's RTSP configuration to use port 5543 instead of ${detectedPort}`
        };
      }

      // Log connection attempt
      logger.logRTSPAttempt(camera.name, rtspUrl, parseInt(detectedPort));

      // Clean up any existing connection
      this.disconnectCamera(camera.id);

      // Set up video element
      videoElement.src = '';
      videoElement.load();

      return new Promise((resolve) => {
        let connectionResolved = false;
        const connectionTimeout = 15000; // 15 seconds

        const resolveOnce = (result: RTSPConnectionResult) => {
          if (!connectionResolved) {
            connectionResolved = true;
            resolve(result);
          }
        };

        // Set up timeout
        const timeoutId = setTimeout(() => {
          logger.logRTSPError(
            camera.name, 
            `Connection timeout after ${connectionTimeout}ms`,
            rtspUrl,
            parseInt(detectedPort)
          );
          resolveOnce({
            success: false,
            error: `Connection timeout for ${camera.name}`,
            details: `Failed to connect to RTSP stream within ${connectionTimeout}ms. Please check:\n• Camera is powered on and accessible\n• RTSP service is enabled on camera\n• Port 5543 is open and accessible\n• Network connectivity to ${parsedUrl.hostname}`
          });
        }, connectionTimeout);

        // Success handler
        const handleSuccess = () => {
          clearTimeout(timeoutId);
          logger.logRTSPSuccess(camera.name, parseInt(detectedPort));
          this.activeConnections.set(camera.id, videoElement);
          resolveOnce({
            success: true,
            videoElement
          });
        };

        // Error handler
        const handleError = (event: any) => {
          clearTimeout(timeoutId);
          const errorMessage = event?.message || event?.error?.message || 'Unknown RTSP connection error';
          logger.logRTSPError(camera.name, errorMessage, rtspUrl, parseInt(detectedPort));
          resolveOnce({
            success: false,
            error: `RTSP connection failed for ${camera.name}`,
            details: `Error: ${errorMessage}\n\nTroubleshooting:\n• Verify camera RTSP settings\n• Check username/password: ${camera.username}\n• Test camera accessibility at ${parsedUrl.hostname}:5543\n• Ensure RTSP is enabled in camera settings`
          });
        };

        // Set up event listeners
        videoElement.addEventListener('loadeddata', handleSuccess, { once: true });
        videoElement.addEventListener('error', handleError, { once: true });
        videoElement.addEventListener('abort', handleError, { once: true });

        // Attempt connection
        try {
          logger.debug(`Setting video source`, 'rtsp-handler', `Source: ${rtspUrl.replace(/(:.*?@)/g, ':****@')}`);
          videoElement.src = rtspUrl;
          videoElement.load();
        } catch (setError) {
          clearTimeout(timeoutId);
          logger.logRTSPError(camera.name, `Failed to set video source: ${setError}`, rtspUrl, parseInt(detectedPort));
          resolveOnce({
            success: false,
            error: `Failed to initialize RTSP stream for ${camera.name}`,
            details: `Error setting video source: ${setError}`
          });
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.logRTSPError(camera.name, `RTSP handler error: ${errorMessage}`);
      return {
        success: false,
        error: `RTSP connection error for ${camera.name}`,
        details: errorMessage
      };
    }
  }

  disconnectCamera(cameraId: string) {
    const videoElement = this.activeConnections.get(cameraId);
    if (videoElement) {
      logger.debug(`Disconnecting RTSP stream`, 'rtsp-handler', `Camera ID: ${cameraId}`);
      videoElement.src = '';
      videoElement.load();
      this.activeConnections.delete(cameraId);
    }
  }

  getActiveConnections(): string[] {
    return Array.from(this.activeConnections.keys());
  }
}

export const rtspHandler = RTSPStreamHandler.getInstance();
