
import { Camera } from "@/types/camera";
import { CameraFormValues } from "../types/cameraModalTypes";

export function mapFormValuesToCamera(formValues: CameraFormValues, group: string): Omit<Camera, "id"> {
  const { 
    name, location, ipAddress, port, username, password, 
    model, manufacturer, connectionType, rtmpUrl, rtspUrl, hlsUrl, onvifPath 
  } = formValues;
  
  const newCamera: Omit<Camera, "id"> = {
    name,
    location,
    ipAddress: ['rtmp', 'hls', 'rtsp'].includes(connectionType) ? "" : ipAddress,
    port: ['rtmp', 'hls', 'rtsp'].includes(connectionType) ? 0 : parseInt(port),
    username,
    password,
    status: "online", // Assuming successful verification sets it to online
    model,
    manufacturer,
    lastSeen: new Date().toISOString(),
    recording: false,
    group,
    connectionType,
    rtmpUrl: connectionType === "rtmp" ? rtmpUrl : undefined,
    rtspUrl: connectionType === "rtsp" ? rtspUrl : undefined,
    hlsUrl: connectionType === "hls" ? hlsUrl : undefined,
    onvifPath: connectionType === "onvif" ? onvifPath : undefined,
  };

  return newCamera;
}
