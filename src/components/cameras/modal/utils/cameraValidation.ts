
import { CameraFormValues } from "../types/cameraModalTypes";

export const validateCameraForm = (formValues: CameraFormValues): { isValid: boolean; errorMessage?: string } => {
  // Required fields for all camera types
  if (!formValues.name || formValues.name.trim() === '') {
    return {
      isValid: false,
      errorMessage: 'Camera name is required'
    };
  }
  
  if (!formValues.location || formValues.location.trim() === '') {
    return {
      isValid: false,
      errorMessage: 'Location is required'
    };
  }
  
  console.log(`Validating camera with connection type: ${formValues.connectionType}`);
  
  // Validate based on connection type
  switch (formValues.connectionType) {
    case 'ip':
    case 'onvif':
      if (!formValues.ipAddress || !isValidIPAddress(formValues.ipAddress)) {
        return {
          isValid: false,
          errorMessage: 'Valid IP address is required'
        };
      }
      break;
      
    case 'rtsp':
      if (!formValues.rtspUrl || !formValues.rtspUrl.startsWith('rtsp://')) {
        return {
          isValid: false,
          errorMessage: 'Valid RTSP URL is required (must start with rtsp://)'
        };
      }
      break;
      
    case 'rtmp':
      if (!formValues.rtmpUrl || !formValues.rtmpUrl.startsWith('rtmp://')) {
        return {
          isValid: false,
          errorMessage: 'Valid RTMP URL is required (must start with rtmp://)'
        };
      }
      break;
      
    case 'hls':
      if (!formValues.hlsUrl || 
         (!formValues.hlsUrl.startsWith('http://') && 
          !formValues.hlsUrl.startsWith('https://'))) {
        return {
          isValid: false,
          errorMessage: 'Valid HLS URL is required (must start with http:// or https://)'
        };
      }
      break;
  }
  
  // Check if new group name is provided when "new" is selected
  if (formValues.group === 'new' && (!formValues.newGroupName || formValues.newGroupName.trim() === '')) {
    return {
      isValid: false,
      errorMessage: 'New group name is required'
    };
  }
  
  // All validations passed
  return { isValid: true };
};

// Helper function to validate IP address
const isValidIPAddress = (ip: string): boolean => {
  // Allow "localhost"
  if (ip.toLowerCase() === 'localhost') {
    return true;
  }
  
  // Basic IP address format validation
  const ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  if (!ipPattern.test(ip)) {
    return false;
  }
  
  // Validate each octet
  const octets = ip.split('.').map(octet => parseInt(octet, 10));
  return octets.every(octet => octet >= 0 && octet <= 255);
};
