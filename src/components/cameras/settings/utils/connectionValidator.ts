
import { Camera } from "@/types/camera";
import { ValidationErrors } from "../types";

export function validateConnectionSettings(
  camera: Camera, 
  connectionType: string
): ValidationErrors {
  const errors: ValidationErrors = {};
  
  // Validate based on connection type
  switch (connectionType) {
    case 'ip':
      if (!camera.ipAddress) {
        errors.ipAddress = "IP Address is required";
      } else if (!isValidIP(camera.ipAddress)) {
        errors.ipAddress = "Invalid IP address format";
      }
      
      if (!camera.port) {
        errors.port = "Port is required";
      } else if (isNaN(Number(camera.port)) || Number(camera.port) < 1 || Number(camera.port) > 65535) {
        errors.port = "Port must be between 1 and 65535";
      }
      break;
      
    case 'onvif':
      if (!camera.ipAddress) {
        errors.ipAddress = "IP Address is required";
      } else if (!isValidIP(camera.ipAddress)) {
        errors.ipAddress = "Invalid IP address format";
      }
      
      if (!camera.port) {
        errors.port = "Port is required";
      }
      
      if (!camera.onvifPath) {
        errors.onvifPath = "ONVIF path is required";
      }
      break;
      
    case 'rtsp':
      if (!camera.rtspUrl) {
        errors.rtspUrl = "RTSP URL is required";
      } else if (!camera.rtspUrl.startsWith('rtsp://')) {
        errors.rtspUrl = "URL must start with rtsp://";
      }
      break;
      
    case 'rtmp':
      if (!camera.rtmpUrl) {
        errors.rtmpUrl = "RTMP URL is required";
      } else if (!camera.rtmpUrl.startsWith('rtmp://')) {
        errors.rtmpUrl = "URL must start with rtmp://";
      }
      break;
      
    case 'hls':
      if (!camera.hlsUrl) {
        errors.hlsUrl = "HLS URL is required";
      } else if (!(camera.hlsUrl.startsWith('http://') || camera.hlsUrl.startsWith('https://'))) {
        errors.hlsUrl = "URL must start with http:// or https://";
      }
      break;
  }
  
  return errors;
}

function isValidIP(ip: string): boolean {
  // Allow localhost for testing
  if (ip.toLowerCase() === 'localhost') return true;
  
  // Regular IP format validation
  const ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  if (!ipPattern.test(ip)) return false;
  
  // Check each octet is in valid range
  const octets = ip.split('.').map(o => parseInt(o, 10));
  return octets.every(octet => octet >= 0 && octet <= 255);
}
