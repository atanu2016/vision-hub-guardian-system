
import { Camera } from "@/types/camera";
import { CameraFormValues } from "../types/cameraModalTypes";

export function mapFormValuesToCamera(formValues: CameraFormValues, group: string): Omit<Camera, "id"> {
  const { 
    name, location, ipAddress, port, username, password, 
    model, manufacturer, connectionType, rtmpUrl, rtspUrl, hlsUrl, onvifPath 
  } = formValues;
  
  console.log(`Mapping camera with connection type: ${connectionType}`);
  console.log(`Connection URLs - RTMP: ${rtmpUrl}, RTSP: ${rtspUrl}, HLS: ${hlsUrl}`);
  
  // Determine which fields to include based on connection type
  const newCamera: Omit<Camera, "id"> = {
    name,
    location,
    status: "online", // Assuming successful verification sets it to online
    lastSeen: new Date().toISOString(),
    recording: false,
    connectionType,
    group,
    
    // Fields that depend on connection type
    ipAddress: ['rtmp', 'hls', 'rtsp'].includes(connectionType) ? "" : ipAddress,
    port: ['rtmp', 'hls', 'rtsp'].includes(connectionType) ? 0 : parseInt(port || "80"),
    username: ['rtmp', 'hls', 'rtsp'].includes(connectionType) ? undefined : username || undefined,
    password: ['rtmp', 'hls', 'rtsp'].includes(connectionType) ? undefined : password || undefined,
    
    // Optional metadata
    model: model || undefined,
    manufacturer: manufacturer || undefined,
    
    // Connection-specific URLs
    rtmpUrl: connectionType === "rtmp" ? rtmpUrl : undefined,
    rtspUrl: connectionType === "rtsp" ? rtspUrl : undefined,
    hlsUrl: connectionType === "hls" ? hlsUrl : undefined,
    onvifPath: connectionType === "onvif" ? onvifPath : undefined,
  };

  console.log("Created camera object:", newCamera);
  return newCamera;
}
