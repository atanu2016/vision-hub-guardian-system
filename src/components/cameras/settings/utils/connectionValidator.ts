
import { Camera } from "@/types/camera";

export interface ValidationErrors {
  [key: string]: string;
}

export const validateConnectionSettings = (
  cameraData: Camera, 
  connectionType: string
): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Validate IP Address for IP, RTSP, and ONVIF connection types
  if (!['rtmp', 'hls'].includes(connectionType)) {
    if (!cameraData.ipAddress?.trim()) {
      errors.ipAddress = 'IP Address is required';
    } else {
      const ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
      if (!ipPattern.test(cameraData.ipAddress)) {
        errors.ipAddress = 'Invalid IP address format';
      }
    }
    
    // Validate port
    if (cameraData.port) {
      if (isNaN(cameraData.port) || cameraData.port < 1 || cameraData.port > 65535) {
        errors.port = 'Port must be between 1-65535';
      }
    }
  }
  
  // Validate RTMP URL
  if (connectionType === 'rtmp') {
    if (!cameraData.rtmpUrl?.trim()) {
      errors.rtmpUrl = 'Stream URL is required for RTMP';
    } else if (!cameraData.rtmpUrl.startsWith('rtmp://')) {
      errors.rtmpUrl = 'RTMP URL should start with rtmp://';
    }
  }
  
  // Validate RTSP URL
  if (connectionType === 'rtsp') {
    if (!cameraData.rtmpUrl?.trim()) {
      errors.rtmpUrl = 'Stream URL is required for RTSP';
    } else if (!cameraData.rtmpUrl.startsWith('rtsp://')) {
      errors.rtmpUrl = 'RTSP URL should start with rtsp://';
    }
  }
  
  // Validate HLS URL
  if (connectionType === 'hls') {
    if (!cameraData.hlsUrl?.trim()) {
      errors.hlsUrl = 'Stream URL is required for HLS';
    } else if (!cameraData.hlsUrl.includes('.m3u8')) {
      errors.hlsUrl = 'HLS URL should include .m3u8 format';
    }
  }

  return errors;
};
