
import { Camera } from "@/types/camera";
import { CameraFormValues } from "../types/cameraModalTypes";

export function mapFormValuesToCamera(formValues: CameraFormValues, group: string): Omit<Camera, "id"> {
  const { 
    name, location, ipAddress, port, username, password, 
    model, manufacturer, connectionType, rtmpUrl, hlsUrl, onvifPath 
  } = formValues;
  
  const newCamera: Omit<Camera, "id"> = {
    name,
    location,
    ipAddress: ['rtmp', 'hls'].includes(connectionType) ? "" : ipAddress,
    port: ['rtmp', 'hls'].includes(connectionType) ? 0 : parseInt(port),
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
    hlsUrl: connectionType === "hls" ? hlsUrl : undefined,
    onvifPath: connectionType === "onvif" ? onvifPath : undefined,
  };

  return newCamera;
}
