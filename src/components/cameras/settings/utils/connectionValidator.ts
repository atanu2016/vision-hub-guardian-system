
import { Camera } from "@/types/camera";

export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Validate camera connection settings based on connection type
 */
export function validateConnectionSettings(
  camera: Partial<Camera>,
  connectionType: string
): ValidationErrors {
  const errors: ValidationErrors = {};
  
  // Validate based on connection type
  switch (connectionType) {
    case 'ip':
    case 'onvif':
      // IP Address validation
      if (!camera.ipAddress) {
        errors.ipAddress = 'IP Address is required';
      } else if (!isValidIpAddress(camera.ipAddress)) {
        errors.ipAddress = 'Invalid IP address format';
      }
      
      // Port validation
      if (!camera.port && camera.port !== 0) {
        errors.port = 'Port is required';
      } else if (camera.port < 0 || camera.port > 65535) {
        errors.port = 'Port must be between 0 and 65535';
      }
      break;
      
    case 'rtmp':
      if (!camera.rtmpUrl) {
        errors.rtmpUrl = 'RTMP URL is required';
      } else if (!camera.rtmpUrl.startsWith('rtmp://')) {
        errors.rtmpUrl = 'RTMP URL must start with rtmp://';
      }
      break;
      
    case 'rtsp':
      if (!camera.rtmpUrl) {
        errors.rtmpUrl = 'RTSP URL is required';
      } else if (!camera.rtmpUrl.startsWith('rtsp://')) {
        errors.rtmpUrl = 'RTSP URL must start with rtsp://';
      }
      break;
      
    case 'hls':
      if (!camera.hlsUrl) {
        errors.hlsUrl = 'HLS URL is required';
      } else if (!isValidHlsUrl(camera.hlsUrl)) {
        errors.hlsUrl = 'Invalid HLS URL format (should end with .m3u8)';
      }
      break;
  }
  
  return errors;
}

/**
 * Check if a string is a valid IP address
 * Allow local IP addresses and hostnames for local network cameras
 */
function isValidIpAddress(ip: string): boolean {
  // Allow hostnames and "localhost" for local network usage
  if (ip === 'localhost' || /^[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z0-9-]+)*$/.test(ip)) {
    return true;
  }
  
  // Standard IP address validation
  const ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  if (!ipPattern.test(ip)) return false;
  
  // Check each octet
  const parts = ip.split('.').map(part => parseInt(part, 10));
  return parts.every(part => part >= 0 && part <= 255);
}

/**
 * Check if a string is a valid HLS URL
 */
function isValidHlsUrl(url: string): boolean {
  // Basic check for HLS URL format
  return url.includes('.m3u8');
}
