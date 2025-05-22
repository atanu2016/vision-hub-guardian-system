
import { CameraConnectionType } from "@/types/camera";
import { CameraFormValues } from "../types/cameraModalTypes";

export function validateCameraForm(formValues: CameraFormValues): {
  isValid: boolean;
  errorMessage?: string;
} {
  const { name, location, connectionType, ipAddress, port, username, password, rtmpUrl, hlsUrl, group, newGroupName } = formValues;
  
  // Basic validation
  if (!name || !location) {
    return { isValid: false, errorMessage: "Please fill in all required fields" };
  }

  // Connection type specific validation
  if (connectionType === "ip") {
    if (!ipAddress || !port) {
      return { isValid: false, errorMessage: "IP address and port are required" };
    }

    // Simple IP validation
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(ipAddress)) {
      return { isValid: false, errorMessage: "Please enter a valid IP address" };
    }
  } else if (connectionType === "rtmp") {
    if (!rtmpUrl) {
      return { isValid: false, errorMessage: "RTMP URL is required" };
    }
    
    // Basic RTMP URL validation
    if (!rtmpUrl.startsWith("rtmp://")) {
      return { isValid: false, errorMessage: "RTMP URL should start with rtmp://" };
    }
  } else if (connectionType === "hls") {
    if (!hlsUrl) {
      return { isValid: false, errorMessage: "HLS URL is required" };
    }
    
    // Basic HLS URL validation
    if (!hlsUrl.includes(".m3u8")) {
      return { isValid: false, errorMessage: "HLS URL should include .m3u8 format" };
    }
  } else if (connectionType === "onvif") {
    if (!ipAddress || !port) {
      return { isValid: false, errorMessage: "IP address and port are required for ONVIF" };
    }
    
    if (!username || !password) {
      return { isValid: false, errorMessage: "Username and password are required for ONVIF" };
    }
  }

  // Process group information
  if (group === "new" && !newGroupName) {
    return { isValid: false, errorMessage: "Please provide a name for the new group" };
  }

  return { isValid: true };
}
