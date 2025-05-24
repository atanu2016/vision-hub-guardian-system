
import { Camera } from "@/types/camera";
import { CameraFormValues } from "../types/cameraModalTypes";

export function mapFormValuesToCamera(formValues: CameraFormValues, group: string): Omit<Camera, "id"> {
  const { 
    name, location, ipAddress, port, username, password, 
    model, manufacturer, connectionType, rtmpUrl, rtspUrl, hlsUrl, onvifPath 
  } = formValues;
  
  console.log(`Mapping camera with connection type: ${connectionType}`);
  console.log(`Connection URLs - RTMP: ${rtmpUrl}, RTSP: ${rtspUrl}, HLS: ${hlsUrl}`);
  
  // For RTSP cameras, extract IP and port from URL if not provided separately
  let finalIpAddress = ipAddress;
  let finalPort = parseInt(port || "80");
  
  if (connectionType === 'rtsp' && rtspUrl) {
    try {
      const url = new URL(rtspUrl);
      // Only override if IP wasn't manually set
      if (!ipAddress || ipAddress === "192.168.1.100") {
        finalIpAddress = url.hostname || ipAddress;
      }
      finalPort = url.port ? parseInt(url.port) : 554;
    } catch (error) {
      console.log("Could not parse RTSP URL, using provided IP and port");
      // For RTSP, default port should be 554
      if (connectionType === 'rtsp' && (!port || port === "80")) {
        finalPort = 554;
      }
    }
  }
  
  // Set default ports based on connection type
  if (connectionType === 'rtsp' && (!port || port === "80")) {
    finalPort = 554;
  } else if (connectionType === 'onvif' && (!port || port === "80")) {
    finalPort = 80; // ONVIF typically uses HTTP port 80 or 8080
  }
  
  const newCamera: Omit<Camera, "id"> = {
    name: name.trim(),
    location: location.trim(),
    status: "online",
    lastSeen: new Date().toISOString(),
    recording: false,
    connectionType: connectionType || 'ip',
    group: group || undefined,
    
    // Always include IP address and port for database compatibility
    ipAddress: finalIpAddress || "0.0.0.0",
    port: finalPort,
    
    // Include credentials if provided
    username: username ? username.trim() : undefined,
    password: password ? password.trim() : undefined,
    
    // Optional metadata
    model: model ? model.trim() : undefined,
    manufacturer: manufacturer ? manufacturer.trim() : undefined,
    
    // Connection-specific URLs - only set the relevant one
    rtmpUrl: connectionType === "rtmp" ? rtmpUrl?.trim() : undefined,
    rtspUrl: connectionType === "rtsp" ? rtspUrl?.trim() : undefined,
    hlsUrl: connectionType === "hls" ? hlsUrl?.trim() : undefined,
    onvifPath: connectionType === "onvif" ? (onvifPath?.trim() || "/onvif/device_service") : undefined,
    
    // Default motion detection to false
    motionDetection: false
  };

  console.log("Created camera object:", newCamera);
  return newCamera;
}
